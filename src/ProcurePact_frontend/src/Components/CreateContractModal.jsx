// import Modal from '@mui/material/Modal';
// import Box from '@mui/material/Box';
// import { useState } from 'react';
// import "../styles/CreateContractModalStyles.css";

// const style = {
//     position: 'absolute',
//     top: '50%',
//     left: '50%',
//     transform: 'translate(-50%, -50%)',
//     width: 400,
//     bgcolor: 'background.paper',
//     border: '2px solid #000',
//     boxShadow: 24,
//     p: 4,
// };

// export default function ModalComponent({ open, setOpen, submitNewContract }) {
//     const handleClose = () => setOpen(false);
//     const [newContract, setNewContract] = useState({
//         name: '',
//         description: '',
//         role: ''
//     });

//     const handleChange = (e) => {
//         e.preventDefault();
//         const { name, value } = e.target;
//         setNewContract((prev) => ({
//             ...prev,
//             [name]: value
//         }));
//     };

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         submitNewContract(newContract.name, newContract.description, newContract.role);
//         setNewContract({
//             name: '',
//             description: '',
//             role: ''
//         });
//         handleClose();
//     }
//     return (
//         <Modal
//             open={open}
//             onClose={handleClose}
//             aria-labelledby="modal-modal-title"
//             aria-describedby="modal-modal-description"
//         >
//             <Box sx={style}>
//                 <h2 id="modal-modal-title">Create Contract</h2>
//                 <form onSubmit={handleSubmit}>
//                     <div className="form-group">
//                         <label htmlFor="contractName" className="form-label">Contract Name</label>
//                         <input type="text" name="name" className="form-control" id="contractName" placeholder="Enter contract name" onChange={handleChange} value={newContract.name} />
//                     </div>
//                     <div className="form-group">
//                         <label htmlFor="contractDescription" className="form-label">Description</label>
//                         <textarea className="form-control" name="description" id="contractDescription" rows="3" placeholder="Enter contract description" onChange={handleChange} value={newContract.description}></textarea>
//                     </div>
//                     <br />
//                     <label htmlFor="role">Role</label>
//                     <select className="form-control" name="role" id="role" onChange={handleChange} value={newContract.role}>
//                         <option value="" disabled>Select Role</option>
//                         <option value="Buyer">BUYER</option>
//                         <option value="Supplier">SUPPLIER</option>
//                         <option value="ThirdParty">3RD PARTY</option>
//                     </select>
//                     <br />
//                     <button type="submit">Create</button>
//                 </form>
//             </Box>
//         </Modal>
//     );
// }


import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import { useState } from 'react';
import "../styles/CreateContractModalStyles.css";

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    outline: 'none',
    border: 'none',
};

export default function ModalComponent({ open, setOpen, submitNewContract }) {
    const handleClose = () => setOpen(false);
    const [newContract, setNewContract] = useState({
        name: '',
        description: '',
        role: ''
    });

    const handleChange = (e) => {
        e.preventDefault();
        const { name, value } = e.target;
        setNewContract((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        submitNewContract(newContract.name, newContract.description, newContract.role);
        setNewContract({
            name: '',
            description: '',
            role: ''
        });
        handleClose();
    }
    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style} className="create-contract-modal-box">
                <h2 id="modal-modal-title" className="create-contract-modal-title">Create Contract</h2>
                <form onSubmit={handleSubmit} className="create-contract-form">
                    <div className="create-contract-form-group">
                        <label htmlFor="contractName" className="create-contract-form-label">Contract Name</label>
                        <input
                            type="text"
                            name="name"
                            className="create-contract-form-control"
                            id="contractName"
                            placeholder="Enter contract name"
                            onChange={handleChange}
                            value={newContract.name}
                        />
                    </div>
                    <div className="create-contract-form-group">
                        <label htmlFor="contractDescription" className="create-contract-form-label">Description</label>
                        <textarea
                            className="create-contract-form-control"
                            name="description"
                            id="contractDescription"
                            rows="3"
                            placeholder="Enter contract description"
                            onChange={handleChange}
                            value={newContract.description}
                        ></textarea>
                    </div>
                    <div className="create-contract-form-group">
                        <label htmlFor="role" className="create-contract-form-label">Role</label>
                        <select
                            className="create-contract-form-control"
                            name="role"
                            id="role"
                            onChange={handleChange}
                            value={newContract.role}
                        >
                            <option value="" disabled>Select Role</option>
                            <option value="Buyer">BUYER</option>
                            <option value="Supplier">SUPPLIER</option>
                            <option value="ThirdParty">3RD PARTY</option>
                        </select>
                    </div>
                    <button type="submit" className="create-contract-submit-btn">Create</button>
                </form>
            </Box>
        </Modal>
    );
}