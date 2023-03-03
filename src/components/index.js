import React from "react";
import { Nav, NavLink, NavMenu, Bars }
    from "./NavElements";

    const Navbar = (admin) => {
        console.log(admin.admin);
        return (
            <>
                <Nav>
                    <NavMenu>
                        <NavLink to="/" activestyle="true">
                            Home
                        </NavLink>
                        <NavLink to="/walletStatus" activestyle="true">
                            Wallet Status
                        </NavLink>
                        <NavLink to="/viewNFT" activestyle="true">
                            View Your NFTs
                        </NavLink>
                        <NavLink to="/sendDon" activestyle="true">
                            Send Donations
                        </NavLink>
                        { admin.admin &&
                          <NavLink to="/adminPage" activestyle="true">
                            Administrator Page
                          </NavLink>
                        }
                    </NavMenu>
                </Nav>
            </>
        );
    };

    export default Navbar;