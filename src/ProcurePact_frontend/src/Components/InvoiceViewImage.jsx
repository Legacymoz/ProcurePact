import React from 'react'
import InvoiceImage from './InvoiceImage'
import '../styles/InvoiceViewImageStyles.css'  
import {useStore} from '../store/useStore'
import { useNavigate } from 'react-router-dom'

const InvoiceViewImage = () => {
  const { selectedInvoiceID, clearSelectedInvoiceID } = useStore();
  const navigate = useNavigate();


  const handleClick = () => {
    navigate(-1);
    clearSelectedInvoiceID();
    
    console.log("Trying to go back.HELPPPP")
  };

  return (
    <div className='invoice-view-image-container'>
        <div className="header">
            <h2>Preview</h2>
            <button className='back-button' onClick={() => {handleClick}}>Back</button>
        </div>
        <div className="image">
            <InvoiceImage />
        </div>
    </div>
  )
}

export default InvoiceViewImage