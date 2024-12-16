const AddIssuer = () => {
    const [issuerAddress, setIssuerAddress] = useState('');
    const [response, setResponse] = useState('');
    const [error, setError] = useState('');

    const handleAddIssuer = async (e) => {
        e.preventDefault();
        setError('');
        setResponse('');

        if (!issuerAddress) {
            setError("Please provide issuer address");
            return;
        }

        try {
            const contract = contractWithSigner();
            const tx = await contract.addIssuer(issuerAddress);
            await tx.wait();
            setResponse(`Issuer with address ${issuerAddress} added successfully.`);
        } catch (err) {
            console.error(err);
            setError(err.message || "Error adding issuer.");
        }
    };

    return (
        <div>
            <h3>Add Issuer</h3>
            <form onSubmit={handleAddIssuer}>
                <div>
                    <label>Issuer Address:</label>
                    <input
                        type="text"
                        value={issuerAddress}
                        onChange={(e) => setIssuerAddress(e.target.value)}
                    />
                </div>
                <button type="submit">Add Issuer</button>
            </form>
            {response && <p>{response}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default AddIssuer;
