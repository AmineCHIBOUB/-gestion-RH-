<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class DepartmentController extends Controller
{
    public function index(): JsonResponse
    {
        try {
            $departments = Department::with([ 'users'])->get();
            return response()->json($departments);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur lors de la récupération des départements',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:departments',
            'code' => 'required|string',
            'description' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Données invalides',
                'messages' => $validator->errors()
            ], 422);
        }

        try {
            $department = Department::create($request->all());
            return response()->json($department->load(['parent']), 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur lors de la création du département',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function show(Department $department): JsonResponse
    {
        return response()->json($department->load([ 'users', 'parent']));
    }

    public function update(Request $request, Department $department): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:departments,name,' . $department->id,
            'description' => 'nullable|string',
            'code' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Données invalides',
                'messages' => $validator->errors()
            ], 422);
        }

        try {
            $department->update($request->all());
            return response()->json($department->load(['manager', 'parent']));
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur lors de la mise à jour du département',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Department $department): JsonResponse
    {
        try {
            $department->delete();
            return response()->json(['message' => 'Département supprimé avec succès']);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur lors de la suppression du département',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}