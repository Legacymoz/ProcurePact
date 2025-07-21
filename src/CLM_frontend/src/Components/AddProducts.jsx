import "../styles/AddProductStyles.css";
import { CLM_backend } from "declarations/CLM_backend";
import { useStore } from "../store/useStore";
import { useEffect, useState } from "react";

const AddProducts = ({currentPricing}) => {
  const [products, setProducts] = useState(currentPricing);
  const selectedContract = useStore((state) => state.selectedContract);

  const addProduct = () => {
    const newProduct = {
      name: "",
      description: "",
      unit_price: "",
      quantity: "",
    };
    setProducts([...products, newProduct]);
  };
  const handleInputChange = (index, field, value) => {
    const updatedProducts = [...products];
    updatedProducts[index][field] = value;
    setProducts(updatedProducts);
  };

  const handleDelete = (index) => {
    const updated = [...products];
    updated.splice(index, 1);
    setProducts(updated);
  };

  const handleSubmit = async () => {
    // Convert unit_price and quantity to BigInt for each product
    const productsWithBigInt = products.map((product) => ({
      ...product,
      unit_price: BigInt(product.unit_price),
      quantity: BigInt(product.quantity),
    }));
    console.log("My products", productsWithBigInt);

    try {
      const data = await CLM_backend.addItems(BigInt(selectedContract), productsWithBigInt).then((response) => {
        if (response.ok) {
          alert(response.ok);
        } else {
          alert("Error adding items. Please try again");
          console.error(response.err);
        }
      })

    } catch (error) {
      console.error("Error adding products:", error);
    }
  };

  return (
    <div className="contract-section-container">
      <div className="contract-header">
        <button onClick={addProduct} className="add-button">
          Add
        </button>
        <h2 className="contract-section-heading">Add Product</h2>
      </div>
      {products.length > 0 ? (
        <div className="product-list">
          {products.map((product, index) => (
            <div key={index} className="product-item">
              <div className="product-header">
                <h3>Product {index + 1}</h3>
                <button
                  onClick={() => handleDelete(index)}
                  className="delete-button"
                >
                  Remove
                </button>
              </div>
              <input
                type="text"
                placeholder="Product Name"
                value={product.name}
                onChange={(e) =>
                  handleInputChange(index, "name", e.target.value)
                }
              />
              <textarea
                placeholder="Description"
                value={product.description}
                onChange={(e) =>
                  handleInputChange(index, "description", e.target.value)
                }
              />
              <input
                type="number"
                placeholder="Unit Price"
                value={product.unit_price}
                onChange={(e) =>
                  handleInputChange(index, "unit_price", e.target.value)
                }
              />
              <input
                type="number"
                placeholder="Quantity"
                value={product.quantity}
                onChange={(e) =>
                  handleInputChange(index, "quantity", e.target.value)
                }
              />
            </div>
          ))}
          <button onClick={handleSubmit} className="submit-button">
            Save
          </button>
        </div>
      ) : (
        <p className="empty-state">No products added</p>
      )}
    </div>
  );
};

export default AddProducts;
