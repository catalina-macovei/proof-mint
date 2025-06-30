import React, { useState, useEffect } from 'react';
import { FaDownload, FaEye, FaFile } from 'react-icons/fa';

const IPFSFilePreview = ({ cid, className = '' }) => {
    const [fileInfo, setFileInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        if (cid) {
            fetchFileInfo();
        }
    }, [cid]);

    const fetchFileInfo = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/v1/file-info/${cid}`);
            if (response.ok) {
                const info = await response.json();
                setFileInfo(info);
            } else {
                setError('Failed to fetch file information');
            }
        } catch (err) {
            console.error('Error fetching file info:', err);
            setError('Error fetching file information');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/v1/file/${cid}`);
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileInfo?.name || `file-${cid}`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                setError('Failed to download file');
            }
        } catch (err) {
            console.error('Error downloading file:', err);
            setError('Error downloading file');
        }
    };

    const isImage = fileInfo?.type?.startsWith('image/');
    const isPDF = fileInfo?.type === 'application/pdf';
    const isText = fileInfo?.type?.startsWith('text/');

    const formatFileSize = (bytes) => {
        if (!bytes) return 'Unknown size';
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    };

    if (loading) {
        return (
            <div className={`p-4 bg-gray-100 dark:bg-gray-800 rounded-lg ${className}`}>
                <p className="text-gray-600 dark:text-gray-300">Loading file information...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`p-4 bg-red-100 dark:bg-red-900 rounded-lg ${className}`}>
                <p className="text-red-600 dark:text-red-300">{error}</p>
            </div>
        );
    }

    return (
        <div className={`p-4 bg-gray-100 dark:bg-gray-800 rounded-lg ${className}`}>
            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
                Certificate File
            </h3>
            
            {fileInfo && (
                <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                        <FaFile className="text-blue-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {fileInfo.name}
                        </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        <p>Type: {fileInfo.type}</p>
                        <p>Size: {formatFileSize(fileInfo.size)}</p>
                    </div>

                    <div className="flex space-x-2">
                        <button
                            onClick={handleDownload}
                            className="flex items-center space-x-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200"
                        >
                            <FaDownload />
                            <span>Download</span>
                        </button>
                        
                        {(isImage || isPDF || isText) && (
                            <button
                                onClick={() => setShowPreview(!showPreview)}
                                className="flex items-center space-x-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200"
                            >
                                <FaEye />
                                <span>{showPreview ? 'Hide Preview' : 'Preview'}</span>
                            </button>
                        )}
                    </div>

                    {showPreview && (
                        <div className="mt-4 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                            {isImage && (
                                <img
                                    src={`http://localhost:8000/api/v1/file/${cid}`}
                                    alt="Certificate"
                                    className="w-full max-h-96 object-contain"
                                />
                            )}
                            
                            {isPDF && (
                                <iframe
                                    src={`http://localhost:8000/api/v1/file/${cid}`}
                                    className="w-full h-96"
                                    title="PDF Preview"
                                />
                            )}
                            
                            {isText && (
                                <div className="p-4 max-h-96 overflow-auto">
                                    <iframe
                                        src={`http://localhost:8000/api/v1/file/${cid}`}
                                        className="w-full h-80 border-none"
                                        title="Text Preview"
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default IPFSFilePreview;
