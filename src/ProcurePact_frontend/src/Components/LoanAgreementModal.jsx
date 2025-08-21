import React, { useRef, useEffect } from "react";
import "../styles/LoanAgreementModalStyles.css";
import LoanAgreement from "./LoanAgreement";

const LoanAgreementModal = ({ isOpen, onClose }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="loan-agreement-modal-overlay">
      <button className="close-btn" onClick={onClose}>
        &times;
      </button>
      <div ref={modalRef} className="loan-agreement-modal-container">
        <LoanAgreement />
      </div>
    </div>
  );
};

export default LoanAgreementModal;
