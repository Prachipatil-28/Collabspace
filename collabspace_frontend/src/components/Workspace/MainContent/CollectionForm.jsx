// src/components/MainContent/CollectionForm.jsx
import React from "react";
import { useForm } from "react-hook-form";

const CollectionForm = ({ onSave, collectionData }) => {
  const { register, handleSubmit, reset, formState } = useForm({
    defaultValues: collectionData || {
      name: "",
      description: "",
    },
  });

  const { errors } = formState;

  const onSubmit = (data) => {
    onSave(data);
    reset();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
    >
      <h2 className="text-xl font-bold mb-4">
        {collectionData ? "Edit Collection" : "Create New Collection"}
      </h2>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Collection Name
        </label>
        <input
          {...register("name", { required: "Collection name is required" })}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          placeholder="Enter collection name"
        />
        {errors.name && (
          <p className="text-red-500 text-xs italic">{errors.name.message}</p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Description
        </label>
        <textarea
          {...register("description", {
            required: "Description is required",
          })}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          placeholder="Enter collection description"
        ></textarea>
        {errors.description && (
          <p className="text-red-500 text-xs italic">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {collectionData ? "Save Changes" : "Create"}
        </button>
        <button
          type="button"
          onClick={() => reset()}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
        >
          Reset
        </button>
      </div>
    </form>
  );
};

export default CollectionForm;
