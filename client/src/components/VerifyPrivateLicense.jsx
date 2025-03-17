import React, { useState } from 'react';
import { ethers } from 'ethers';
import { verifyProof } from '../eas/merkel_private_attestation';


const VerifyPrivateLicense = () => {
    const [attestationUID, setAttestationUID] = useState('');
    const [multiProofJson, setMultiProofJson] = useState('');
    const [verificationResult, setVerificationResult] = useState(null);
    const [error, setError] = useState('');

    const handleVerify = async () => {
        if (!attestationUID || !multiProofJson) {
            setError("Please enter all required fields.");
            return;
        }
    
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
    
            // Ensure attestationUID is formatted correctly
            let cleanedAttestationUID = attestationUID.trim();
            if (!cleanedAttestationUID.startsWith("0x")) {
                cleanedAttestationUID = "0x" + cleanedAttestationUID;
            }
    
            if (!ethers.isHexString(cleanedAttestationUID)) {
                setError("Invalid Attestation UID format.");
                return;
            }
    
            let parsedMultiProof;
            
            // Check if `multiProofJson` is a string (from textarea input)
            if (typeof multiProofJson === "string") {
                try {
                    parsedMultiProof = JSON.parse(multiProofJson);
                    if (typeof parsedMultiProof !== "object" || parsedMultiProof === null) {
                        throw new Error("Parsed JSON is not an object.");
                    }
                } catch (e) {
                    setError("Invalid JSON format for multiProofJson.");
                    console.error("JSON Parse Error:", e.message);
                    return;
                }
            } else if (typeof multiProofJson === "object") {
                parsedMultiProof = multiProofJson;
            } else {
                setError("multiProofJson must be a valid JSON object.");
                return;
            }
    
            // **Ensure it is stringified before passing**
            const stringifiedProof = JSON.stringify(parsedMultiProof);
    
            console.log("Final MultiProof JSON String:", stringifiedProof);
    
            // Call verifyProof with properly formatted data
            const result = await verifyProof(signer, cleanedAttestationUID, stringifiedProof);
            setVerificationResult(result);
            setError("");
        } catch (err) {
            setError("Error verifying proof: " + err.message);
            console.error(err);
        }
    };
    
    
    
    
    
    
    return (
        <div className="min-h-screen flex flex-col justify-center items-center p-10">
            <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-300">
                <h2 className="text-2xl font-semibold text-center mb-4 text-gray-800 dark:text-white">
                    Verify Private License
                </h2>

                <input
                    type="text"
                    placeholder="Enter Attestation UID"
                    value={attestationUID}
                    onChange={(e) => setAttestationUID(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg mb-4"
                />

                <textarea
                    placeholder="Enter JSON proof"
                    value={multiProofJson}
                    onChange={(e) => setMultiProofJson(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg mb-4 h-32"
                />

                <button
                    onClick={handleVerify}
                    className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                    Verify Proof
                </button>

                {error && <p className="mt-4 text-red-500 font-medium">{error}</p>}
                
                {verificationResult !== null && (
                    <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <p className="text-lg font-medium">
                            Verification Result: {JSON.stringify(verificationResult, null, 2)}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyPrivateLicense;


/*
corect test values:
0xd5301007fad51773edd17ef13eccac5c1d582114578452a8ef229d4f438c3038

{
  "leaves": [
    {
      "type": "string",
      "name": "studentName",
      "value": "Test Name",
      "salt": "0xb1897907026f8a97fab7b99dbf16d5b8b01e46e49820f05181ba4eae9be48585"
    },
    {
      "type": "string",
      "name": "universityDID",
      "value": "did:ethr:0xb4baa0098fe8ff203c2a419a8bd24173e5f94eb1",
      "salt": "0x4b7bc04ec355f754d270451e2a2cc3d7c4d149ac15361805fd95dfd7e87dca7f"
    }
  ],
  "proof": [
    "0x52f7ed371cfb98687856215230af44ca2f1332ee8118fd7df52c400aaf23b5a1",
    "0x8153be1294c291fc8c509a38b8ef58ecca779d7537f3a98f2556eb33f521c3de",
    "0x980050b1026514922df6c171747a853a1b63169a5da60f777725084188e1d103"
  ],
  "proofFlags": [
    false,
    false,
    false,
    true
  ]
}
*/