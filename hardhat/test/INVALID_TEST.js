const { expect } = require("chai");

const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers")

describe("Token contract", function() {
    async function deployTokenFixture() {
        const Token = await ethers.getContractFactory("Token");
        const [owner, addr1, addr2] = await ethers.getSigners();

        const hardhatToken = await Token.deploy();

        await hardhatToken.deployed();

        return { Token, hardhatToken, owner, addr1, addr2 };
    }

    describe("Deployment", function() {
        it("Should set owner", async function() {
            const {hardhatToken, owner} = await loadFixture(deployTokenFixture);

            expect(await hardhatToken.owner()).to.equal(owner.address);
        });

        it("Set total supply to owner", async function() {
            const {hardhatToken, owner} = await loadFixture(deployTokenFixture);
            const ownerBalance = await hardhatToken.balanceOf(owner.address)
            expect(await hardhatToken.totalSupply()).to.equal(ownerBalance)
        });
    });

    describe("Transferring Tokens", function() {
        it("Transfer tokens between accounts", async function() {
            const {hardhatToken, owner, addr1, addr2} = await loadFixture(deployTokenFixture);

            await expect(hardhatToken.transfer(addr1.address, 50)).to.changeTokenBalances(hardhatToken, [owner, addr1], [-50, 50]);

            await expect(hardhatToken.connect(addr1).transfer(addr2.address, 50))
            .to.changeTokenBalances(hardhatToken, [addr1, addr2], [-50, 50]);
        });
    });

    describe("Emitting transfer events", function() {
        it("Transfer tokens between addresses", async function() {
            const {hardhatToken, owner, addr1, addr2} = await loadFixture(deployTokenFixture);

            await expect(hardhatToken.transfer(addr1.address, 50))
            .to.emit(hardhatToken, "Transfer")
            .withArgs(owner.address, addr1.address, 50);

            await expect(hardhatToken.connect(addr1).transfer(addr2.address, 50))
            .to.emit(hardhatToken, "Transfer")
            .withArgs(addr1.address, addr2.address, 50);
        });
    });
});