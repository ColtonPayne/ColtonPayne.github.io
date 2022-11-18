const { expect } = require("chai");

const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

const totalFunds = 10000000

describe("PROPEL Contract", function() {
    async function deployPropelFixture() {
        const PROPEL = await ethers.getContractFactory("PROPEL");

        const [owner, addr1, addr2] = await ethers.getSigners();

        const propelToken = await PROPEL.deploy(totalFunds);

        await propelToken.deployed();

        return {PROPEL, propelToken, owner, addr1, addr2};
    }

    describe("Deployment of PROPEL Contract", function() {
        it ("Whoever Deploys the contract Should be the Owner", async function () {
            const {propelToken, owner} = await loadFixture(deployPropelFixture);

            expect(await propelToken.owner()).to.equal(owner.address);
        });
        it ("Owner's token should hold totalFunds at First", async function() {
            const {propelToken, owner} = await loadFixture(deployPropelFixture);
            const ownerValue = await propelToken.getTokenValue(owner.address);
            expect(totalFunds).to.equal(ownerValue);
        })
    });

    describe("Generate Tokens", function() {
        it("Generate Token for Investor", async function() {
            const {propelToken, owner, addr1} = await loadFixture(deployPropelFixture);
            
            const ownerBeforeBalance = await propelToken.getTokenValue(owner.address);

            await propelToken.generateToken(addr1.address, 10000, "INVESTOR");

            const ownerAfterBalance = await propelToken.getTokenValue(owner.address);

            expect(ownerBeforeBalance-10000).to.equal(ownerAfterBalance);

            const newTokenID = await propelToken.getID(addr1.address);
            const newTokenValue = await propelToken.getTokenValue(addr1.address);
            const newTokenType = await propelToken.getTypeOfAddr(addr1.address);

            expect(newTokenID).to.equal("test_unique_id");
            expect(newTokenValue).to.equal(10000);
            expect(newTokenType).to.equal("INVESTOR");
        });
        it("Generate Token for Investee", async function() {
            const {propelToken, owner, addr1} = await loadFixture(deployPropelFixture);
            
            const ownerBeforeBalance = await propelToken.getTokenValue(owner.address);

            await propelToken.generateToken(addr1.address, 100000, "INVESTEE");

            const ownerAfterBalance = await propelToken.getTokenValue(owner.address);

            expect(ownerBeforeBalance-100000).to.equal(ownerAfterBalance);

            const newTokenID = await propelToken.getID(addr1.address);
            const newTokenValue = await propelToken.getTokenValue(addr1.address);
            const newTokenType = await propelToken.getTypeOfAddr(addr1.address);

            expect(newTokenID).to.equal("test_unique_id");
            expect(newTokenValue).to.equal(100000);
            expect(newTokenType).to.equal("INVESTEE");
        });
    });

    describe("Transferring Value From Investor to Investee", function() {
        it("Transfer Chosen Value from Investor to Investee", async function() {
            const {propelToken, owner, addr1, addr2} = await loadFixture(deployPropelFixture);

            await propelToken.generateToken(addr1.address, 100000, "INVESTOR");
            await propelToken.generateToken(addr2.address, 0, "INVESTEE");

            const addr1Before = await propelToken.getTokenValue(addr1.address);
            const addr2Before = await propelToken.getTokenValue(addr2.address);

            await propelToken.connect(addr1).transferValueBetween(addr2.address, 50000);

            const addr1After = await propelToken.getTokenValue(addr1.address);
            const addr2After = await propelToken.getTokenValue(addr2.address);

            expect(addr1Before-50000).to.equal(addr1After);
            expect(addr2Before+50000).to.equal(addr2After);
        });
    });

    describe("Contract Successfully Emits Functions", function() {
        it("Should Emit The Generate Token Function", async function() {
            const {propelToken, owner, addr1, addr2} = await loadFixture(deployPropelFixture);

            await expect(propelToken.generateToken(addr1.address, 100000, "INVESTOR")).to.emit(propelToken, "TransferToken")
            .withArgs(owner.address, addr1.address, 100000);
        });

        it("Should Emit The Transfer Value Function", async function() {
            const {propelToken, owner, addr1, addr2} = await loadFixture(deployPropelFixture);

            await propelToken.generateToken(addr1.address, 100000, "INVESTOR");
            await propelToken.generateToken(addr2.address, 0, "INVESTEE");

            await expect(propelToken.connect(addr1).transferValueBetween(addr2.address, 50000))
            .to.emit(propelToken, "TransferValue")
            .withArgs(addr1.address, 50000, addr2.address);
        });
    });
});