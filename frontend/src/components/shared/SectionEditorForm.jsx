import { useState } from "react";
import ImageUpload from "./ImageUpload";
import { toast } from "react-toastify";

const SectionEditorForm = ({ title, pageName, sectionName, initialData, onSubmit }) => {
    const [formData, setFormData] = useState({
        title: initialData?.title || "",
        description: initialData?.description || "",
        image: null
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (file) => {
        setFormData(prev => ({ ...prev, image: file }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const form = new FormData();
        form.append("title", formData.title);
        form.append("description", formData.description);
        if (formData.image) {
            form.append("image", formData.image);
        }

         try {
                await onSubmit(form, pageName, sectionName);// Aquí se pasa el FormData, no un objeto JS
                toast.success(`✅ Section "${title}" updated successfully`);
            } catch (err) {
                console.error(`❌ Error al guardar sección ${pageName}/${sectionName}:`, err);
                toast.error("❌ Failed to save changes. Please try again.");
            }
    };

    return(
        <>
            <form onSubmit={handleSubmit} className="p-4 border rounded bg-white shadow-md max-w-xl mx-auto" >
                <h2 className="text-xl font-bold mb-4">Edit section: {title}</h2>

                <label className="block mb-2">Title</label>
                <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full p-2 border mb-4" 
                />

                <label className="block mb-2">Description</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full p-2 border mb-4"
                />

                <ImageUpload 
                    onChange={handleImageChange} 
                    initialImageUrl={initialData?.imageUrl}
                />

                <button 
                    type="submit" 
                    className="mt-4 w-full px-4 py-2 rounded bg-blue-600 text-white 
                               hover:bg-blue-700 active:bg-blue-800 active:scale-95 
                               focus:outline-none focus:ring-2 focus:ring-blue-300 
                               transition duration-150 ease-in-out">
                    Save Changes
                </button>
            </form>
            <br/>
        </>
    );
};

export default SectionEditorForm;