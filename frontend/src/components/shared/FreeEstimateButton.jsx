import { useNavigate } from 'react-router-dom';

export const FreeEstimateButton = ({ color = "bg-green-600", className="" }) => {
    const navigate = useNavigate();

    return (
        <button
            className={`${color} hover:opacity-90 text-white font-semibold px-6 py-2 rounded mt-4 ${className}`}
            onClick={() => navigate("/contact")}
        >
            Free Estimate
        </button>
    );
};

