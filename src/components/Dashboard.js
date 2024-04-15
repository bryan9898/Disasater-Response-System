import React, { useEffect, useState } from 'react';
import { db } from '../firebase-config';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { 
    Container, Grid, Card, CardContent, Typography, CardActions, Button, Select, MenuItem, FormControl, InputLabel 
} from '@mui/material';
import { format } from 'date-fns'; // Add date formatting utility

const Dashboard = () => {
    const [reports, setReports] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState('');
    const [locations, setLocations] = useState([]);

    // Fetch reports from Firestore and order by creation date
    useEffect(() => {
        const fetchReports = async () => {
            const reportsCollectionRef = collection(db, "reports");
            const q = query(reportsCollectionRef, orderBy("createdAt", "desc")); // Order reports by date
            const data = await getDocs(q);
            const loadedReports = data.docs.map(doc => ({ ...doc.data(), id: doc.id, createdAt: doc.data().createdAt.toDate() }));
            setReports(loadedReports);
            // Extract unique locations for filtering
            const uniqueLocations = [...new Set(loadedReports.map(report => report.location))];
            setLocations(uniqueLocations);
        };

        fetchReports();
    }, []);

    const handleLocationChange = (event) => {
        setSelectedLocation(event.target.value);
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Typography variant="h4" sx={{ mb: 4, textAlign: 'center' }}>Reports Dashboard</Typography>
            <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="location-select-label">Location</InputLabel>
                <Select
                    labelId="location-select-label"
                    id="location-select"
                    value={selectedLocation}
                    label="Location"
                    onChange={handleLocationChange}
                >
                    <MenuItem value="">
                        <em>All</em>
                    </MenuItem>
                    {locations.map((location) => (
                        <MenuItem key={location} value={location}>{location}</MenuItem>
                    ))}
                </Select>
            </FormControl>
            <Grid container spacing={3}>
                {reports.filter(report => selectedLocation === '' || report.location === selectedLocation).map((report) => (
                    <Grid item xs={12} sm={6} md={4} key={report.id}>
                        <Card raised sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <CardContent>
                                <Typography gutterBottom variant="h5" component="div">
                                    {report.location}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {report.description}
                                </Typography>
                                <Typography sx={{ mt: 1.5, fontWeight: 'bold' }}>
                                    Verified: {report.verified ? <span>&#10003;</span> : <span style={{ color: 'red' }}>&times;</span>}
                                </Typography>
                                <Typography sx={{ mt: 1.5, fontStyle: 'italic' }}>
                                    Date: {format(report.createdAt, 'PPPppp')} {/* Format the date */}
                                </Typography>
                                {report.category && (
                                    <Typography sx={{ mt: 1.5 }}>
                                        Category: {report.category}
                                    </Typography>
                                )}
                                {report.imageUrl && (
                                    <img
                                        src={report.imageUrl}
                                        alt="Report"
                                        style={{ width: '100%', marginTop: 10, borderRadius: 5 }}
                                    />
                                )}
                            </CardContent>
                            <CardActions sx={{ mt: 'auto' }}>
                                <Button size="small" onClick={() => console.log("View Details")}>View Details</Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default Dashboard;
