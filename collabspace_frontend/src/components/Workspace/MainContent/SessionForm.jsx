// src/components/MainContent/SessionForm.jsx
import React from "react";
import { useForm } from "react-hook-form";

const SessionForm = ({ onSave, sessionData }) => {
  const { register, handleSubmit, reset, formState } = useForm({
    defaultValues: sessionData || {
      title: "",
      agenda: "",
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
        {sessionData ? "Edit Session" : "Create New Session"}
      </h2>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Session Title
        </label>
        <input
          {...register("title", { required: "Session title is required" })}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          placeholder="Enter session title"
        />
        {errors.title && (
          <p className="text-red-500 text-xs italic">{errors.title.message}</p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Agenda
        </label>
        <textarea
          {...register("agenda", { required: "Agenda is required" })}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          placeholder="Enter session agenda"
        ></textarea>
        {errors.agenda && (
          <p className="text-red-500 text-xs italic">{errors.agenda.message}</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {sessionData ? "Save Changes" : "Create"}
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

export default SessionForm;
