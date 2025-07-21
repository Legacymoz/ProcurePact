import { useEffect, useState } from "react";
import { useAuth } from "../Hooks/AuthContext";
import { CLM_backend } from 'declarations/CLM_backend';
import { useNavigate } from "react-router-dom";
import "../styles/Profile.css"


const Profile = () => {
    let navigate = useNavigate();
    const { user, isAuthenticated, setUser, principal } = useAuth();
    const [userData, setUserData] = useState({
        name: user?.name,
        email: user?.email,
        phone: user?.phone,
        bio: user?.bio,
        address: user?.address
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData((prev) => ({
            ...prev,
            [name]: value
        }));
    };
    //create or update
    const handleSubmit = async (e) => {
        if (!isAuthenticated) {
            alert("Log in!")
            return;
        };

        e.preventDefault();
        try {
            const method = user != null ? "updateUser" : "addUser";
            console.log(method, "method");
            const response = await CLM_backend[method](
                userData.name,
                userData.email,
                userData.phone,
                userData.address,
                userData.bio
            );
            {/*
                Destrtructure response if needed
                */}
            alert(response);
            CLM_backend.getUser
        } catch (error) {
            alert(error);
        } finally {
            await CLM_backend.getUser(principal).then((userData) => {
                console.log(userData[0]);
                setUser(userData[0]);
            });
            navigate("/");
        }
    };

    useEffect(() => {
        if (user?.length != 0) {
            setUserData({
                name: user?.name,
                email: user?.email,
                phone: user?.phone,
                bio: user?.bio,
                address: user?.address
            })
        }
    }, [user]);

    return <>
        <div className="profile-container">
            <h1>Profile</h1>
            {isAuthenticated ?
                <>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="name">Name</label>
                            <input
                                name="name"
                                id="name"
                                className="form-control"
                                value={userData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                name="email"
                                id="email"
                                className="form-control"
                                onChange={handleChange}
                                value={userData.email}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="address">Address</label>
                            <input
                                name="address"
                                id="address"
                                className="form-control"
                                onChange={handleChange}
                                value={userData.address}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="phone">Phone</label>
                            <input
                                name="phone"
                                id="phone"
                                className="form-control"
                                onChange={handleChange}
                                value={userData.phone}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="bio">Bio</label>
                            <textarea
                                name="bio"
                                id="bio"
                                className="form-control"
                                onChange={handleChange}
                                value={userData.bio}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary mt-3">
                            {user == null || user.length == 0 ? "Create" : "Update"}
                        </button>
                    </form>
                </> : <>
                    <h2>Please log in!</h2>
                </>}
        </div>
    </>

}

export default Profile;