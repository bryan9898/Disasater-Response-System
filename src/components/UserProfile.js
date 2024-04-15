import React, { useEffect, useState } from 'react';
import { db } from '../firebase-config';
import { doc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { Avatar, Box, Card, CardContent, Typography, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

const UserProfile = () => {
  const [userProfile, setUserProfile] = useState({});
  const [verificationActivities, setVerificationActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      const userRef = doc(db, "users", currentUser.uid);
      onSnapshot(userRef, (doc) => {
        setUserProfile(doc.data());
        setLoading(false);
      });

      // Query for the user's verification activities
      const verificationsRef = collection(db, "verifications");
      const q = query(verificationsRef, where("userId", "==", currentUser.uid));
      onSnapshot(q, (querySnapshot) => {
        const activities = querySnapshot.docs.map(doc => doc.data());
        setVerificationActivities(activities);
      });
    }
  }, [currentUser]);

  if (loading) {
    return <Typography>Loading profile...</Typography>;
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh" flexDirection="column">
      <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
        {userProfile.email ? userProfile.email[0].toUpperCase() : 'U'}
      </Avatar>
      <Typography variant="h4" gutterBottom>{userProfile.email}</Typography>
      <Typography variant="subtitle1" gutterBottom>VeriCoins: {userProfile.veriCoins}</Typography>

      <Card sx={{ minWidth: 275, mt: 2 }}>
        <CardContent>
          <Typography variant="h6" component="div">
            Your Verification Activity
          </Typography>
          <List>
            {verificationActivities.map((activity, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemIcon>
                    {activity.verified ? <CheckCircleOutlineIcon color="success" /> : <CancelOutlinedIcon color="error" />}
                  </ListItemIcon>
                  <ListItemText primary={activity.reportDescription} secondary={`Verified as: ${activity.verified ? 'True' : 'False'}`} />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};

export default UserProfile;
