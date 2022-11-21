const {
    Connection,
    PublicKey,
    clusterApiUrl,
    Keypair,
    LAMPORTS_PER_SOL,
    Transaction,
    SystemProgram,
    sendAndConfirmRawTransaction,
    sendAndConfirmTransaction
} = require("@solana/web3.js");


const connection = new Connection(clusterApiUrl("devnet"), "confirmed");


const getWalletBalance = async (publickey, wallet = "Sender") => { 
    try {
        const walletBalance = await connection.getBalance(publickey);
        console.log(`Current ${wallet} Wallet Balance has : ${parseInt(walletBalance) / LAMPORTS_PER_SOL} SOL`);
    }
    catch(err) {
        console.log(err);
    }
}

const transferSol = async () => 
{
    // The Sender Wallet
    const from = Keypair.fromSecretKey(Keypair.generate()["_keypair"]["secretKey"]);

    // The Receiver Wallet
    const to = Keypair.generate();


    // Airdrop SOL to the Sender Wallet
    console.log("Airdropping SOL to Sender Wallet.");
    const fromAirDropSignature = await connection.requestAirdrop(
        new PublicKey(from.publicKey),
        2 * LAMPORTS_PER_SOL
    );

    let latestBlockHash = await connection.getLatestBlockhash();

    await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: fromAirDropSignature
    });

    // Display balance of the Sender Wallet after Airdrop
    getWalletBalance(from.publicKey);

    // Pass the 50% balance of the Sender Wallet to the Receiver Wallet
    const walletBalance = await connection.getBalance(from.publicKey);
    var transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: from.publicKey,
            toPubkey: to.publicKey,
            lamports: LAMPORTS_PER_SOL * ((parseInt(walletBalance) / LAMPORTS_PER_SOL) / 2)
        })
    );

    // Get the Transaction Signature
    var signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [from]
    );
    console.log('Transaction Signature is ', signature);

    // Check the Balance of the Receiver Wallet
    getWalletBalance(to.publicKey, "Receiver");

    // Check the Balance of the Sender Wallet
    getWalletBalance(from.publicKey);

}

transferSol();