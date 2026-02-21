<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    // get all users from database
    public function index()
    {
        // fetch all users from database
        $users = User::all();
        
        // return users as JSON (converts to array format)
        return response()->json($users);
    }

    // create a new user
    public function store(Request $request)
    {
        // check if all required fields are provided
        $name = $request->input('name');
        $email = $request->input('email');
        $password = $request->input('password');
        $role = $request->input('role');
        $status = $request->input('status');

        // validate the data
        if (empty($name)) {
            return response()->json(['error' => 'Name is required'], 400);
        }
        if (empty($email)) {
            return response()->json(['error' => 'Email is required'], 400);
        }
        if (empty($password) || strlen($password) < 6) {
            return response()->json(['error' => 'Password must be at least 6 characters'], 400);
        }

    
        // check if email already exists
        $existingUser = User::where('email', $email)->first();
        if ($existingUser) {
            return response()->json(['error' => 'Email already exists'], 400);
        }

        // create the new user
        $newUser = new User();
        $newUser->name = $name;
        $newUser->email = $email;
        $newUser->password = bcrypt($password);  // Hash password for security
        $newUser->role = $role;
        $newUser->status = $status;
        $newUser->save();  // Save to database

        // return the created user
        return response()->json($newUser, 201);
    }

    // get one specific user
    public function show($id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }
        return response()->json($user);
    }

    // Update a user
    public function update(Request $request, $id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }
        $name = $request->input('name');
        $email = $request->input('email');
        $role = $request->input('role');
        $status = $request->input('status');

        if (!empty($name)) {
            $user->name = $name;
        }
        if (!empty($email)) {
            $user->email = $email;
        }
        if (!empty($role)) {
            $user->role = $role;
        }
        if (!empty($status)) {
            $user->status = $status;
        }

        // Save changes
        $user->save();

        // Return updated user
        return response()->json($user);
    }

    // Delete a user
    public function destroy($id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }
        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }
}
