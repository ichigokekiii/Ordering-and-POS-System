<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Content;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ContentController extends Controller
{
    private const CMS_IMAGE_UPLOAD_LIMIT_LABEL = '2MB';

    private function normalizeContentInput(Request $request): void
    {
        $normalizedInput = [];

        if ($request->has('page')) {
            $normalizedInput['page'] = trim((string) $request->input('page'));
        }

        if ($request->has('identifier')) {
            $normalizedInput['identifier'] = trim((string) $request->input('identifier'));
        }

        if ($request->has('type')) {
            $normalizedInput['type'] = trim((string) $request->input('type'));
        }

        if ($request->exists('content_text')) {
            $normalizedInput['content_text'] = trim((string) $request->input('content_text'));
        }

        if (!empty($normalizedInput)) {
            $request->merge($normalizedInput);
        }
    }

    private function canManageContent(Request $request): bool
    {
        $user = $request->user();

        return $user && in_array(strtolower((string) $user->role), ['admin', 'owner', 'staff'], true);
    }

    private function imageValidationMessages(): array
    {
        return [
            'content_image.required' => 'Please upload an image for this content.',
            'content_image.uploaded' => 'Image upload failed. Please use an image under ' . self::CMS_IMAGE_UPLOAD_LIMIT_LABEL . '.',
            'content_image.image' => 'Only image files can be uploaded.',
            'content_image.mimes' => 'Only JPG, JPEG, and PNG files are allowed.',
            'content_image.max' => 'Image must be ' . self::CMS_IMAGE_UPLOAD_LIMIT_LABEL . ' or smaller.',
        ];
    }

    // Get all content
    public function index(Request $request)
    {
        try {
            $contents = Content::query()
                ->when(!$this->canManageContent($request), fn ($query) => $query->where('isArchived', false))
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json($contents);
        } catch (\Exception $e) {
            return $this->serverErrorResponse('Failed to fetch content', $e);
        }
    }

    public function show(Request $request, $id)
    {
        try {
            $content = Content::query()
                ->when(!$this->canManageContent($request), fn ($query) => $query->where('isArchived', false))
                ->findOrFail($id);

            return response()->json($content);
        } catch (\Exception $e) {
            return $this->serverErrorResponse('Failed to fetch content', $e);
        }
    }

    // Create new content
    public function store(Request $request)
    {
        $this->normalizeContentInput($request);

        $request->validate([
            'page' => 'required|string|max:255',
            'type' => 'required|in:text,image',
            'content_text' => [
                Rule::requiredIf($request->input('type') === 'text'),
                'string',
                'regex:/\S/',
            ],
            'content_image' => [
                Rule::requiredIf($request->input('type') === 'image'),
                'image',
                'mimes:jpg,jpeg,png',
                'max:2048',
            ],
            'identifier' => [
                'required',
                'string',
                'max:255',
                Rule::unique('contents')->where(fn ($query) => $query->where('page', $request->page)->where('isArchived', false)),
            ],
        ], array_merge($this->imageValidationMessages(), [
            'content_text.required' => 'Content text is required.',
            'content_text.regex' => 'Content text cannot be empty.',
        ]));

        try {
            $content = new Content();
            $content->identifier = $request->identifier;
            $content->page = $request->page;
            $content->type = $request->type;

            if ($request->type === 'text') {
                $content->content_text = $request->content_text;
            }

            if ($request->type === 'image' && $request->hasFile('content_image')) {
                $path = $request->file('content_image')->store('contents', 'public');
                $content->content_image = Storage::url($path);
            }

            $content->isArchived = false;
            $content->save();

            return response()->json([
                'message' => 'Content created successfully',
                'content' => $content
            ], 201);
        } catch (\Exception $e) {
            return $this->serverErrorResponse('Failed to create content', $e);
        }
    }

    // Update content
    public function update(Request $request, $id)
    {
        $this->normalizeContentInput($request);

        $content = Content::findOrFail($id);
        $contentType = $request->input('type', $content->type);

        if ($request->filled('identifier') || $request->filled('page')) {
            $request->validate([
                'identifier' => [
                    'nullable',
                    'string',
                    'max:255',
                    Rule::unique('contents')
                        ->ignore($content->id)
                        ->where(fn ($query) => $query->where('page', $request->input('page', $content->page))->where('isArchived', false)),
                ],
                'page' => 'nullable|string|max:255',
            ]);
        }

        $request->validate([
            'type' => 'sometimes|in:text,image',
            'content_text' => [
                Rule::requiredIf($contentType === 'text' && $request->exists('content_text')),
                'nullable',
                'string',
                'regex:/\S/',
            ],
            'content_image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ], array_merge($this->imageValidationMessages(), [
            'content_text.required' => 'Content text is required.',
            'content_text.regex' => 'Content text cannot be empty.',
        ]));

        try {
            if ($request->filled('identifier')) {
                $content->identifier = $request->identifier;
            }

            if ($request->filled('page')) {
                $content->page = $request->page;
            }

            if ($request->exists('content_text')) {
                $content->content_text = $request->input('content_text');
            }

            if ($request->hasFile('content_image')) {
                if ($content->content_image) {
                    Storage::disk('public')->delete(str_replace('/storage/', '', $content->content_image));
                }

                $path = $request->file('content_image')->store('contents', 'public');
                $content->content_image = Storage::url($path);
            }

            if ($request->has('isArchived')) {
                $content->isArchived = $request->isArchived;
            }

            $content->save();

            return response()->json([
                'message' => 'Content updated successfully',
                'content' => $content
            ]);
        } catch (\Exception $e) {
            return $this->serverErrorResponse('Failed to update content', $e);
        }
    }

    // Delete content permanently
    public function destroy($id)
    {
        try {
            $content = Content::findOrFail($id);

            if ($content->content_image) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $content->content_image));
            }

            $content->delete();

            return response()->json([
                'message' => 'Content deleted successfully'
            ]);
        } catch (\Exception $e) {
            return $this->serverErrorResponse('Failed to delete content', $e);
        }
    }

    // Delete archived content only (Admin)
    public function destroyArchived($id)
    {
        try {
            $content = Content::findOrFail($id);

            // Ensure only archived content can be deleted
            if (!$content->isArchived) {
                return response()->json([
                    'message' => 'Only archived content can be deleted'
                ], 403);
            }

            if ($content->content_image) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $content->content_image));
            }

            $content->delete();

            return response()->json([
                'message' => 'Archived content deleted successfully'
            ]);

        } catch (\Exception $e) {
            return $this->serverErrorResponse('Failed to delete archived content', $e);
        }
    }
}
