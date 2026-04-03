<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Content;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ContentController extends Controller
{
    // Get all content
    public function index()
    {
        try {
            $contents = Content::orderBy('created_at', 'desc')->get();
            return response()->json($contents);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch content',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Create new content
    public function store(Request $request)
    {
        $request->validate([
            'page' => 'required|string|max:255',
            'type' => 'required|in:text,image',
            'content_text' => 'nullable|string',
            'content_image' => 'nullable|image|mimes:jpeg,png,jpg|max:5120',
            'identifier' => [
                'required',
                'string',
                'max:255',
                Rule::unique('contents')->where(fn ($query) => $query->where('page', $request->page)),
            ],
        ]);

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
            return response()->json([
                'message' => 'Failed to create content',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Update content
    public function update(Request $request, $id)
    {
        try {
            $content = Content::findOrFail($id);

            if ($request->filled('identifier') || $request->filled('page')) {
                $request->validate([
                    'identifier' => [
                        'nullable',
                        'string',
                        'max:255',
                        Rule::unique('contents')
                            ->ignore($content->id)
                            ->where(fn ($query) => $query->where('page', $request->input('page', $content->page))),
                    ],
                    'page' => 'nullable|string|max:255',
                ]);
            }

            if ($request->filled('identifier')) {
                $content->identifier = $request->identifier;
            }

            if ($request->filled('page')) {
                $content->page = $request->page;
            }

            if ($request->filled('content_text')) {
                $content->content_text = $request->content_text;
            }

            if ($request->hasFile('content_image')) {
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
            return response()->json([
                'message' => 'Failed to update content',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Delete content permanently
    public function destroy($id)
    {
        try {
            $content = Content::findOrFail($id);
            $content->delete();

            return response()->json([
                'message' => 'Content deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete content',
                'error' => $e->getMessage()
            ], 500);
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

            $content->delete();

            return response()->json([
                'message' => 'Archived content deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete archived content',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
