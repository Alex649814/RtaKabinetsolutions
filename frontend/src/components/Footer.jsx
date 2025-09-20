const Footer = () => {
    return (
      <footer className="text-gray-600 body-font border-t border-gray-200">
      <div className="container px-5 py-8 mx-auto flex md:items-start md:flex-row flex-col items-center justify-between">
        <div className="flex flex-col items-start md:items-start">
          <h2 className="title-font font-medium text-gray-900 text-xl mb-4">RTA KABINETS</h2>
          <div className="flex space-x-4">
            <a className="text-gray-500" href="#">
              <i className="fab fa-facebook-f text-xl"></i>
            </a>
            <a className="text-gray-500" href="#">
              <i className="fab fa-linkedin-in text-xl"></i>
            </a>
            <a className="text-gray-500" href="#">
              <i className="fab fa-youtube text-xl"></i>
            </a>
            <a className="text-gray-500" href="#">
              <i className="fab fa-instagram text-xl"></i>
            </a>
          </div>
        </div>
    
        <div className="flex flex-col md:text-left text-center">
          <h3 className="text-gray-900 font-medium">Location</h3>
          <p>4500 East Grand Road<br />Tucson, AZ 85712</p>
        </div>
    
        <div className="flex flex-col md:text-left text-center mt-6 md:mt-0">
          <h3 className="text-gray-900 font-medium">Hours</h3>
          <p>Monday - Saturday<br />10 AM - 5 PM</p>
        </div>
    
        <div className="flex flex-col md:text-left text-center mt-6 md:mt-0">
          <h3 className="text-gray-900 font-medium">Contact</h3>
          <p>+ 520-668-0771<br />Carpentry.ido@gmail.com</p>
        </div>
      </div>
    </footer>
    
      );
    };
    
    export default Footer;