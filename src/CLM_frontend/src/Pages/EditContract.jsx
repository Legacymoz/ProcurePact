// import { useParams } from 'react-router-dom';
// import { CLM_backend } from 'declarations/CLM_backend';
// import { useEffect, useState } from 'react';



// const EditContract = () => {
//     const [contract, setContract] = useState([]);
//     //get contract id from params
//     let params = useParams();
//     //fetch full contract details
//     const fetchContractDetails = async () => {
//         try {
//             const response = await CLM_backend.getContractDetails(BigInt(params.id));
//             console.log("contract details", response);
//             setContract(response.ok);
//         } catch (error) {
//             console.log(error);
//         }
//     }

//     useEffect(() => {
//         fetchContractDetails()
//     }, []);

//     //edit contract
//     return (<>
//         <div className='container-fluid'>
//             <h1>{contract.name}</h1>
//         </div>
//     </>)
// };
// export default EditContract;



import { useParams } from 'react-router-dom';
import { CLM_backend } from 'declarations/CLM_backend';
import { useEffect, useState } from 'react';
import "../styles/EditContractStyles.css";

const EditContract = () => {
    const [contract, setContract] = useState(null);
    const [supplierId, setSupplierId] = useState('');
    const [buyerId, setBuyerId] = useState('');
    const [products, setProducts] = useState([]);
    const [priceMap, setPriceMap] = useState({});
    const [paymentTerms, setPaymentTerms] = useState('');
    const [newProduct, setNewProduct] = useState('');

    const params = useParams();

    // Fetch contract details
    const fetchContractDetails = async () => {
        try {
            const response = await CLM_backend.getContractDetails(BigInt(params.id));
            const data = response.ok;
            setContract(data);

            const prices = {};
            if (data.products && data.prices) {
                data.products.forEach((p, i) => {
                    prices[p] = data.prices[i];
                });
            }

            setSupplierId(data.supplierId || '');
            setBuyerId(data.buyerId || '');
            setProducts(data.products || []);
            setPriceMap(prices);
            setPaymentTerms(data.paymentTerms || '');
        } catch (error) {
            console.error("Error fetching contract:", error);
        }
    };

    useEffect(() => {
        fetchContractDetails();
    }, []);

    const handlePriceChange = (product, value) => {
        setPriceMap((prev) => ({
            ...prev,
            [product]: parseFloat(value)
        }));
    };

    const handleAddProduct = () => {
        const product = newProduct.trim();
        if (!product || products.includes(product)) return;

        setProducts((prev) => [...prev, product]);
        setPriceMap((prev) => ({ ...prev, [product]: 0 }));
        setNewProduct('');
    };

    const handleRemoveProduct = (product) => {
        setProducts((prev) => prev.filter((p) => p !== product));
        setPriceMap((prev) => {
            const { [product]: _, ...rest } = prev;
            return rest;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // const priceArray = products.map((p) => priceMap[p]);  it was for changing the prices, into an array

        const data = {
            id: BigInt(params.id),
            supplierId,
            buyerId,
            products,
            prices: priceMap,
            paymentTerms
        };

        // try {
        //     const result = await CLM_backend.updateContract(data);                         );
        //     alert("Contract updated successfully!");
        //     console.log("Update result:", result);
        // } catch (err) {
        //     console.error("Update failed:", err);
        //     alert("Error updating contract.");
        // }

        console.log(data)
    };

    if (!contract) return <p>Loading...</p>;

    return (
        <div className='editContract-container'>
            <h1>Edit Contract: {contract.name}</h1>

            <form onSubmit={handleSubmit} className="edit-contract-form">
                <div className="form-group">
                    <label>Supplier ID</label>
                    <input
                        value={supplierId}
                        onChange={(e) => setSupplierId(e.target.value)}
                        className="form-control"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Buyer ID</label>
                    <input
                        value={buyerId}
                        onChange={(e) => setBuyerId(e.target.value)}
                        className="form-control"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Add Product</label>
                    <div className="add-product-row">
                        <input
                            type="text"
                            placeholder="Enter product name"
                            value={newProduct}
                            onChange={(e) => setNewProduct(e.target.value)}
                            className="form-control"
                        />
                        <button
                            type="button"
                            onClick={handleAddProduct}
                            className="btn-success"
                        >
                            +
                        </button>
                    </div>
                </div>

                {products.length > 0 && (
                    <div className="form-group">
                        <label>Products & Prices</label>
                        {products.map((product, index) => (
                            <div key={index} className="price-input-row">
                                <span className="product-name">{product}</span>
                                <input
                                    type="number"
                                    value={priceMap[product]}
                                    onChange={(e) => handlePriceChange(product, e.target.value)}
                                    className="form-control"
                                    min="0"
                                    required
                                />
                                <span>KSH</span>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveProduct(product)}
                                    className="btn-danger"
                                >
                                    x
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="form-group">
                    <label>Payment Terms</label>
                    <select
                        value={paymentTerms}
                        onChange={(e) => setPaymentTerms(e.target.value)}
                        className="form-control"
                        required
                    >
                        <option value="">Select payment terms</option>
                        <option value="Upon delivery">Upon delivery</option>
                    </select>
                </div>

                <button type="submit" className="btn-editContract mt-3">
                    Update Contract
                </button>
            </form>
        </div>
    );
};

export default EditContract;

