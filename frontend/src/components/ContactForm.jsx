import { useState } from 'react';
import { toast } from 'react-toastify';
import { API_URL } from "../lib/api";

function ContactForm() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    contactBy: {
      phone: false,
      email: false,
    },
    message: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, checked } = e.target;

    if (name === 'phoneContact' || name === 'emailContact') {
      setForm({
        ...form,
        contactBy: {
          ...form.contactBy,
          [name === 'phoneContact' ? 'phone' : 'email']: checked
        }
      });
    } else if (name === 'phone') {
      const onlyNumbers = value.replace(/\D/g, '');
      const limited = onlyNumbers.slice(0, 10);
      setForm({ ...form, phone: limited });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.firstName.trim()) newErrors.firstName = 'First name is required.';
    if (!form.lastName.trim()) newErrors.lastName = 'Last name is required.';
    if (!form.email.includes('@')) newErrors.email = 'Enter a valid email.';
    if (!form.phone.trim() || !/^\d+$/.test(form.phone)) newErrors.phone = 'Enter a valid phone number.';
    if (!form.contactBy.phone && !form.contactBy.email) newErrors.contactBy = 'Select at least one contact method.';
    if (!form.message.trim()) newErrors.message = 'Message cannot be empty.';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        throw new Error('Error sending form');
      }

      await response.json();
      toast.success(`¡Form sent successfully!`);
      setForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        contactBy: { phone: false, email: false },
        message: '',
      });
      setErrors({});
    } catch (error) {
      console.error(error);
      toast.error('There was an error submitting the form.');
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-10 shadow-lg w-full max-w-3xl min-h-[700px] flex flex-col justify-between"
      >
        <div className="flex gap-4 mb-4">
          <div className="w-1/2">
            <label className="block text-lg font-medium mb-1 text-gray-800">First Name</label>
            <input
              type="text"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              placeholder="First Name"
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
            {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
          </div>

          <div className="w-1/2">
            <label className="block text-lg font-medium mb-1 text-gray-800">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              placeholder="Last Name"
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
            {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}
          </div>
        </div>

        <div className="flex gap-4 mb-4">
          <div className="w-1/2">
            <label className="block text-lg font-medium mb-1 text-gray-800">Email Address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email@example.net"
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>

          <div className="w-1/2">
            <label className="block text-lg font-medium mb-1 text-gray-800">Phone</label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="(123) 456-7890"
              className="w-full border border-gray-300 rounded px-3 py-2"
              maxLength={10}
              inputMode="numeric"
              pattern="[0-9]*"
            />
            {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
          </div>
        </div>

        <div className="mb-4">
          <p className="text-lg font-medium mb-2 text-gray-800">Best way to contact you:</p>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="phoneContact"
                checked={form.contactBy.phone}
                onChange={handleChange}
                className="accent-black"
              />
              Phone
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="emailContact"
                checked={form.contactBy.email}
                onChange={handleChange}
                className="accent-black"
              />
              Email
            </label>
          </div>
          {errors.contactBy && <p className="text-red-500 text-sm">{errors.contactBy}</p>}
        </div>

        <div className="mb-6">
          <label className="block text-lg font-medium mb-1 text-gray-800">Your Message</label>
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            rows="4"
            placeholder="Enter your question or message"
            className="w-full border border-gray-300 rounded px-3 py-2 resize-none"
          />
          {errors.message && <p className="text-red-500 text-sm">{errors.message}</p>}
        </div>

        <button
          type="submit"
          className="w-full bg-black text-white py-2 px-4 rounded hover:bg-gray-900 transition text-xl"
        >
          Submit
        </button>
      </form>
    </>
  );
}

export default ContactForm;