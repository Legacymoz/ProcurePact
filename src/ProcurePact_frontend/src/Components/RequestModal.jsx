import Modal from "@mui/material/Modal";
import Box from '@mui/material/Box';
import { useState } from "react";
import { Principal } from "@dfinity/principal";
import "../styles/RequestModalStyles.css";

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

export default function RequestModal({ open, setOpen, requestConnection }) {
    const handleClose = () => setOpen(false);
    const [principal, setPrincipal] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        requestConnection(Principal.fromText(principal))
        handleClose()
        setPrincipal("");
    };

    return (
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="request-modal-title"
        aria-describedby="request-modal-description"
      >
        <div className="request-modal-outer" onClick={handleClose}>
          <div
            className="request-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close-modal-x"
              type="button"
              aria-label="Close"
              onClick={handleClose}
            >
              &times;
            </button>
            <h2 id="request-modal-title">Request Connection</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="principal" className="form-label">
                  Connection Principal
                </label>
                <input
                  type="text"
                  name="principal"
                  className="form-control"
                  placeholder="Enter connection principal"
                  onChange={(e) => setPrincipal(e.target.value)}
                />
              </div>
              <button type="submit" className="submit-button">
                Send Request
              </button>
            </form>
          </div>
        </div>
      </Modal>
    );
}