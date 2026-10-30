<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class PostController extends Controller
{
    /**
     * Display a listing of posts.
     */
    public function index(): JsonResponse
    {
        $posts = Post::with('department')->get();
        
        return response()->json([
            'success' => true,
            'data' => $posts
        ]);
    }

    /**
     * Store a newly created post.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'titre' => 'required|string|max:255',
            'description' => 'nullable|string',
            'department_id' => 'required|exists:departments,id',
            'salaire_min' => 'nullable|numeric|min:0',
            'salaire_max' => 'nullable|numeric|min:0|gte:salaire_min',
            'niveau' => 'required',
            'statut' => ['required', Rule::in(['actif', 'inactif'])]
        ]);

        $post = Post::create($validated);
        $post->load('department');

        return response()->json([
            'success' => true,
            'message' => 'Post créé avec succès',
            'data' => $post
        ], 201);
    }

    /**
     * Display the specified post.
     */
    public function show(Post $post): JsonResponse
    {
        $post->load('department');
        
        return response()->json([
            'success' => true,
            'data' => $post
        ]);
    }

    /**
     * Update the specified post.
     */
    public function update(Request $request, Post $post): JsonResponse
    {
        $validated = $request->validate([
            'titre' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'department_id' => 'sometimes|required|exists:departments,id',
            'salaire_min' => 'nullable|numeric|min:0',
            'salaire_max' => 'nullable|numeric|min:0|gte:salaire_min',
            'niveau' => 'sometimes',
            'statut' => ['sometimes', 'required', Rule::in(['actif', 'inactif'])]
        ]);

        $post->update($validated);
        $post->load('department');

        return response()->json([
            'success' => true,
            'message' => 'Post mis à jour avec succès',
            'data' => $post
        ]);
    }

    /**
     * Remove the specified post.
     */
    public function destroy(Post $post): JsonResponse
    {
        $post->delete();

        return response()->json([
            'success' => true,
            'message' => 'Post supprimé avec succès'
        ]);
    }
}