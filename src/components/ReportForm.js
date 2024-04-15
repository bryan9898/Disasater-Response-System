import React, { useState } from 'react';
import { db, storage } from '../firebase-config';
import { collection, addDoc, getCountFromServer } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Container, Typography, Paper, Box, CircularProgress } from '@mui/material';
import axios from 'axios'; // Import Axios

const ReportForm = () => {
    const [reportData, setReportData] = useState({ location: '', description: '' });
    const [imageFile, setImageFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false); 
    const navigate = useNavigate();

    const handleChange = (e) => {
        if (e.target.name === 'image') {
            setImageFile(e.target.files[0]);
        } else {
            setReportData({ ...reportData, [e.target.name]: e.target.value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true); 

       
        try {
            const { data } = await axios.post('http://localhost:5000/checkdisaster', {
                description: reportData.description
            });
            const disasterOrNot = data.prediction.split(",");
            console.log(disasterOrNot[0]);
            if (disasterOrNot[0] !== 'Disaster') {
                
                alert('Report is not identified as a disaster. It will not be saved.');
                setIsLoading(false); // End loading
                return;
            }

          
            let imageUrl = '';
            let disasterCategory = '';
            if (imageFile) {
                const formData = new FormData();
                formData.append('image', imageFile);
    
                
                const classificationResponse = await axios.post('http://localhost:5000/classifyImage', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                disasterCategory = classificationResponse.data.classification;
    
                // Upload image to Firebase storage
                const imageRef = ref(storage, `reports/${imageFile.name}_${Date.now()}`);
                const snapshot = await uploadBytes(imageRef, imageFile);
                imageUrl = await getDownloadURL(snapshot.ref);
            }

         
            await addDoc(collection(db, "reports"), {
                ...reportData,
                imageUrl,
                createdAt: new Date(),
                category: disasterCategory,
                verified: false,
                countFalse : 0,
                countTrue : 0,
                verifiedByFalse : [],
                verifiedByTrue : []
            });
            navigate('/dashboard');
        } catch (error) {
            console.error("Error: ", error);
            alert('There was an error processing your report.');
        } finally {
            setIsLoading(false); 
        }
    };

    return (
        <Container  maxWidth="sm"  sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5">Submit a Report</Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
        <TextField
                            margin="normal"
                            fullWidth
                            id="location"
                            label="Location"
                            name="location"
                            value={reportData.location}
                            onChange={handleChange}
                        />
        <TextField
                            margin="normal"
                            fullWidth
                            id="description"
                            label="Description"
                            name="description"
                            value={reportData.description}
                            onChange={handleChange}
                        />
        <TextField
                            type="file"
                            name="image"
                            onChange={handleChange}
                            margin="normal"
                            fullWidth
                        />
        {/* Conditionally display the submit button or loading indicator */}
        {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <CircularProgress />
        </Box>
        ) : (
        <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
        Submit Report
        </Button>
        )}
        </Box>
        </Paper>
        </Container>
    );
};

export default ReportForm;
