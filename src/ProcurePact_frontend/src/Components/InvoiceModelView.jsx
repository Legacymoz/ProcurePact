// import React, { useRef, useEffect } from "react";
// import "../styles/InvoiceModelViewStyles.css";
// import InvoiceImage from "./InvoiceImage";
// import { useStore } from "../store/useStore";

// const InvoiceModelView = ({ isOpen, onClose }) => {
//   const modalRef = useRef(null);
//   const { selectedInvoiceID } = useStore();

//   // Close modal when clicking outside
//   useEffect(() => {
//     function handleClickOutside(event) {
//       if (modalRef.current && !modalRef.current.contains(event.target)) {
//         onClose();
//       }
//     }
//     if (isOpen) {
//       document.addEventListener("mousedown", handleClickOutside);
//     }
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [isOpen, onClose]);

//   // Animation classes
//   const modalClass = isOpen
//     ? "invoice-modal-view-container slide-in"
//     : "invoice-modal-view-container slide-out";

//   if (!isOpen) return null;

//   return (
//     <div className="invoice-modal-overlay">
//       <div ref={modalRef} className={modalClass} style={{ width: "50vh" }}>
//         <button className="close-btn" onClick={onClose}>
//           &times;
//         </button>
//         <InvoiceImage />
//       </div>
//     </div>
//   );
// };

// export default InvoiceModelView;



// import React, { useRef, useEffect, useState, useCallback } from "react";
// import "../styles/InvoiceModelViewStyles.css";
// import InvoiceImage from "./InvoiceImage";
// import { useStore } from "../store/useStore";

// const InvoiceModelView = ({ isOpen, onClose }) => {
//   const modalRef = useRef(null);
//   const { selectedInvoiceID } = useStore();
//   const [show, setShow] = useState(isOpen);

//   // Sync local "show" state with isOpen
//   useEffect(() => {
//     if (isOpen) {
//       setShow(true);
//     }
//   }, [isOpen]);

//   // Close when clicking outside modal
//   const handleClickOutside = useCallback(
//     (event) => {
//       if (modalRef.current && !modalRef.current.contains(event.target)) {
//         onClose();
//       }
//     },
//     [onClose]
//   );

//   // Close with Escape key
//   const handleKeyDown = useCallback(
//     (event) => {
//       if (event.key === "Escape") {
//         onClose();
//       }
//     },
//     [onClose]
//   );

//   useEffect(() => {
//     if (isOpen) {
//       document.addEventListener("mousedown", handleClickOutside);
//       document.addEventListener("keydown", handleKeyDown);
//     }
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//       document.removeEventListener("keydown", handleKeyDown);
//     };
//   }, [isOpen, handleClickOutside, handleKeyDown]);

//   const handleAnimationEnd = () => {
//     if (!isOpen) setShow(false); // unmount only after slide-out animation finishes
//   };

//   if (!show) return null;

//   return (
//     <div className="invoice-modal-overlay">
//       <div
//         ref={modalRef}
//         className={`invoice-modal-view-container ${
//           isOpen ? "slide-in" : "slide-out"
//         }`}
//         onAnimationEnd={handleAnimationEnd}
//       >
//         <button className="close-btn" onClick={onClose}>
//           &times;
//         </button>
//         <InvoiceImage invoiceId={selectedInvoiceID} />
//       </div>
//     </div>
//   );
// };

// export default InvoiceModelView;


import React, { useRef, useEffect, useState } from "react";
import "../styles/InvoiceModelViewStyles.css";
import InvoiceImage from "./InvoiceImage";
import { useStore } from "../store/useStore";

const InvoiceModelView = ({ isOpen, onClose }) => {
  const modalRef = useRef(null);
  const { selectedInvoiceID } = useStore();
  const [show, setShow] = useState(false);

  // Handle show state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setShow(true); // mount modal
    }
  }, [isOpen]);

  const handleAnimationEnd = () => {
    if (!isOpen) {
      setShow(false); // unmount after closing animation
    }
  };

  if (!show) return null;

  return (
    <div
      className="invoice-modal-overlay"
      onClick={onClose} // close on overlay click
    >
      <div
        ref={modalRef}
        className={`invoice-modal-view-container ${
          isOpen ? "slide-in" : "slide-out"
        }`}
       
        onAnimationEnd={handleAnimationEnd}
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside modal
      >
        <button className="close-btn" onClick={onClose}>
          &times;
        </button>
        <InvoiceImage />
      </div>
    </div>
  );
};

export default InvoiceModelView;
