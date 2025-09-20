

const GoogleMap = () => {

    return (
        <div className="w-full h-full mb-4">
            <h2 className="text-3xl font-bold mb-4 text-center">Location</h2>
            <div className="w-full h-[calc(100%-4rem)]">
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d210.8933662742635!2d-110.8967688084557!3d32.250174836316276!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x86d66e242429f00f%3A0xb221e9b0862c3135!2s4500%20E%20Grant%20Rd%2C%20Tucson%2C%20AZ%2085712%2C%20USA!5e0!3m2!1sen!2smx!4v1745386930367!5m2!1sen!2smx"
                        className="w-full h-full rounded-lg border-4 border-white shadow-lg"
                        style={{ border: 0 }}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        allowFullScreen
                ></iframe>
            </div>
        </div>
    );
};

export default GoogleMap;