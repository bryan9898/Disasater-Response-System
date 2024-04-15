// src/components/Home.js
import React from 'react';
import { Button, Typography, Container, Box, Paper, Grid } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Home = () => {
  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ mt: 8, p: 4, backgroundImage: `url(/images/disaster-response.jpg)`, backgroundSize: 'cover', color: '#fff' }}>
        <Grid container spacing={2} alignItems="center" justifyContent="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h3" color="black" gutterBottom>
              Ready to Help?
            </Typography>
            <Typography variant="h5" color="black" paragraph>
              Join our community of responders now and make a difference!
            </Typography>
            <Box>
              <Button variant="contained" color="secondary" component={RouterLink} to="/report" sx={{ marginRight: 2 }}>
                Report a Disaster
              </Button>
              <Button variant="outlined" color="secondary" component={RouterLink} to="/dashboard">
                View Dashboard
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Home;
