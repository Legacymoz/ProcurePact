// import "../styles/AddProductStyles.css";
// import { ProcurePact_backend } from "declarations/ProcurePact_backend";
// import { useStore } from "../store/useStore";
// import { useEffect, useState } from "react";

// const AddProducts = ({currentPricing}) => {
//   const [products, setProducts] = useState(currentPricing);
//   const selectedContract = useStore((state) => state.selectedContract);

//   const addProduct = () => {
//     const newProduct = {
//       name: "",
//       description: "",
//       unit_price: "",
//       quantity: "",
//     };
//     setProducts([...products, newProduct]);
//   };
//   const handleInputChange = (index, field, value) => {
//     const updatedProducts = [...products];
//     updatedProducts[index][field] = value;
//     setProducts(updatedProducts);
//   };

//   const handleDelete = (index) => {
//     const updated = [...products];
//     updated.splice(index, 1);
//     setProducts(updated);
//   };

//   const handleSubmit = async () => {
//     // Convert unit_price and quantity to BigInt for each product
//     const productsWithBigInt = products.map((product) => ({
//       ...product,
//       unit_price: BigInt(product.unit_price),
//       quantity: BigInt(product.quantity),
//     }));
//     console.log("My products", productsWithBigInt);

//     try {
//       const data = await ProcurePact_backend.addItems(BigInt(selectedContract), productsWithBigInt).then((response) => {
//         if (response.ok) {
//           alert(response.ok);
//         } else {
//           alert("Error adding items. Please try again");
//           console.error(response.err);
//         }
//       })

//     } catch (error) {
//       console.error("Error adding products:", error);
//     }
//   };

//   return (
//     <div className="contract-section-container">
//       <div className="contract-header">
//         <button onClick={addProduct} className="add-button">
//           Add
//         </button>
//         <h2 className="contract-section-heading">Add Product</h2>
//       </div>
//       {products.length > 0 ? (
//         <div className="product-list">
//           {products.map((product, index) => (
//             <div key={index} className="product-item">
//               <div className="product-header">
//                 <h3>Product {index + 1}</h3>
//                 <button
//                   onClick={() => handleDelete(index)}
//                   className="delete-button"
//                 >
//                   Remove
//                 </button>
//               </div>
//               <input
//                 type="text"
//                 placeholder="Product Name"
//                 value={product.name}
//                 onChange={(e) =>
//                   handleInputChange(index, "name", e.target.value)
//                 }
//               />
//               <textarea
//                 placeholder="Description"
//                 value={product.description}
//                 onChange={(e) =>
//                   handleInputChange(index, "description", e.target.value)
//                 }
//               />
//               <input
//                 type="number"
//                 placeholder="Unit Price"
//                 value={product.unit_price}
//                 onChange={(e) =>
//                   handleInputChange(index, "unit_price", e.target.value)
//                 }
//               />
//               <input
//                 type="number"
//                 placeholder="Quantity"
//                 value={product.quantity}
//                 onChange={(e) =>
//                   handleInputChange(index, "quantity", e.target.value)
//                 }
//               />
//             </div>
//           ))}
//           <button onClick={handleSubmit} className="submit-button">
//             Save
//           </button>
//         </div>
//       ) : (
//         <p className="empty-state">No products added</p>
//       )}
//     </div>
//   );
// };

// export default AddProducts;



import "../styles/AddProductStyles.css";
import { ProcurePact_backend } from "declarations/ProcurePact_backend";
import { useStore } from "../store/useStore";
import { useState } from "react";

const initialProduct = {
  name: "",
  description: "",
  unit_price: "",
  quantity: "",
};

const AddProducts = ({ currentPricing }) => {
  const [products, setProducts] = useState(currentPricing);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalProduct, setModalProduct] = useState(initialProduct);
  const [editIndex, setEditIndex] = useState(null);
  const selectedContract = useStore((state) => state.selectedContract);

  const openAddModal = () => {
    setModalProduct(initialProduct);
    setEditIndex(null);
    setModalOpen(true);
  };

  const openEditModal = (product, index) => {
    setModalProduct(product);
    setEditIndex(index);
    setModalOpen(true);
  };

  const handleModalChange = (field, value) => {
    setModalProduct((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleModalSave = () => {
    if (
      !modalProduct.name ||
      !modalProduct.unit_price ||
      !modalProduct.quantity
    ) {
      alert("Name, Unit Price, and Quantity are required.");
      return;
    }
    if (editIndex !== null) {
      // Edit existing product
      const updated = [...products];
      updated[editIndex] = modalProduct;
      setProducts(updated);
    } else {
      // Add new product
      setProducts([...products, modalProduct]);
    }
    setModalOpen(false);
  };

  const handleDelete = (index) => {
    const updated = [...products];
    updated.splice(index, 1);
    setProducts(updated);
  };

  const handleSubmit = async () => {
    const productsWithBigInt = products.map((product) => ({
      ...product,
      unit_price: BigInt(product.unit_price),
      quantity: BigInt(product.quantity),
    }));
    try {
      await ProcurePact_backend.addItems(
        BigInt(selectedContract),
        productsWithBigInt
      ).then((response) => {
        if (response.ok) {
          alert(response.ok);
        } else {
          alert("Error adding items. Please try again");
        }
      });
    } catch (error) {
      console.error("Error adding products:", error);
    }
  };

  return (
    <div className="add-product-main-container">
      <div className="contract-header">
        <button onClick={openAddModal} className="add-button">
          Add
        </button>
        <h2 className="contract-section-heading">Add Product</h2>
      </div>
      {products.length > 0 ? (
        <div className="product-table-container">
          <table className="product-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Unit Price</th>
                <th>Quantity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, idx) => (
                <tr key={idx}>
                  <td>{product.name}</td>
                  <td>{product.description}</td>
                  <td>{product.unit_price}</td>
                  <td>{product.quantity}</td>
                  <td>
                    <button
                      className="edit-button"
                      onClick={() => openEditModal(product, idx)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => handleDelete(idx)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={handleSubmit} className="submit-button">
            Save
          </button>
        </div>
      ) : (
        <p className="empty-state">No products</p>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="product-modal-overlay">
          <div className="product-modal-box">
            <h3>{editIndex !== null ? "Edit Product" : "Add Product"}</h3>
            <input
              type="text"
              placeholder="Product Name"
              value={modalProduct.name}
              onChange={(e) => handleModalChange("name", e.target.value)}
              className="product-modal-input"
            />
            <textarea
              placeholder="Description"
              value={modalProduct.description}
              onChange={(e) => handleModalChange("description", e.target.value)}
              className="product-modal-input"
            />
            <input
              type="number"
              placeholder="Unit Price"
              value={modalProduct.unit_price}
              onChange={(e) => handleModalChange("unit_price", e.target.value)}
              className="product-modal-input"
            />
            <input
              type="number"
              placeholder="Quantity"
              value={modalProduct.quantity}
              onChange={(e) => handleModalChange("quantity", e.target.value)}
              className="product-modal-input"
            />
            <div className="product-modal-actions">
              <button
                className="submit-button"
                onClick={handleModalSave}
              >
                Save
              </button>
              <button
                className="delete-button"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddProducts;