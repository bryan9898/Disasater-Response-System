import React, { useEffect, useState } from 'react';
import { db } from '../firebase-config';
import {collection,doc,updateDoc,onSnapshot,  query,  where,  arrayUnion,  increment , addDoc , deleteDoc} from 'firebase/firestore';
import {  Button,  Card,  CardContent,  Typography,  Box,  CircularProgress,  RadioGroup,  FormControlLabel,  Radio,  CardActions} from '@mui/material';
import { useAuth } from '../context/AuthContext';

const ReportVerification = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const q = query(collection(db, "reports"), where("verified", "==", false));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedReports = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toLocaleString()
      }));
      setReports(loadedReports);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleVerify = async (report, decision) => {
    const reportRef = doc(db, "reports", report.id);
    const verifiedByField = decision === "True" ? "verifiedByTrue" : "verifiedByFalse";
    const decisionField = decision === "True" ? "countTrue" : "countFalse";
  
    // Check if the current user has already verified this report
    if (report.verifiedByTrue.includes(currentUser.email) || report.verifiedByFalse.includes(currentUser.email)) {
      alert("You have already verified this report.");
      return;
    }
  
    try {
      await updateDoc(reportRef, {
        [verifiedByField]: arrayUnion(currentUser.email), 
        [decisionField]: increment(1)
      });
      
      // Record the verification action in the 'verifications' collection
      const verificationRef = collection(db, "verifications");
      await addDoc(verificationRef, {
        userId: currentUser.uid, 
        reportId: report.id,
        reportDescription: report.description,
        verified: decision === "True",
        timestamp: new Date() // Record the time when verification was done
      });


      // Additional logic if verification criteria is met
      if (decision === 'True' && report.countTrue + 1 >= 5) {
        await updateDoc(reportRef, { verified: true });
      } else if (decision === 'False' && report.countFalse + 1 >= 10) {
        await moveReportToLearning(report);
      }
  
      updateVeriCoinsForUser(1); // Award 1 VeriCoin to the user
    } catch (error) {
      console.error("Error updating document: ", error);
    }

    alert("Report verified successfully.");
  };
  

  const moveReportToLearning = async (report) => {
    const reportRef = doc(db, "reports", report.id);
    const learningRef = collection(db, "learning");
  
    try {
      await addDoc(learningRef, {
        ...report,
        movedToLearning: new Date(), // Track when it was moved
        status: "false" // Indicating that the report was verified as false
      });
        // Delete the report from the "reports" collection
      await deleteDoc(reportRef);
      console.log("False report moved to learning database and removed from reports.");
    } catch (error) {
      console.error("Error processing the report: ", error);
    }
  
  };
  
  

  const updateVeriCoinsForUser = async (coins) => {
    const userRef = doc(db, "users", currentUser.uid); // Use UID instead of email
    
    
    try {
      await updateDoc(userRef, {
        veriCoins: increment(coins) // Make sure increment is imported from Firebase
      });
      
      console.log("User coins updated successfully.");
    } catch (error) {
      console.error("Error updating user coins: ", error);
    }
  };
  
  
  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box sx={{ margin: 2 }}>
      <Typography variant="h4" gutterBottom>Verify Reports</Typography>
      {reports.map((report) => (
        <Card key={report.id} sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>{report.description}</Typography>
            <Typography variant="body2" color="textSecondary">{report.location}</Typography>
            <Typography variant="body2" color="textSecondary">Category: {report.category}</Typography> {/* Display category */}
            <Typography variant="body2" color="textSecondary">Submitted on: {report.createdAt}</Typography>
          </CardContent>
          <CardActions>
      
            <Button variant="outlined" onClick={() => handleVerify(report, 'True')}>Verify as True</Button>
            <Button variant="outlined" onClick={() => handleVerify(report, 'False')}>Verify as False</Button>
          </CardActions>
        </Card>
      ))}
      {reports.length === 0 && <Typography>No reports to verify.</Typography>}
    </Box>
  );
};

export default ReportVerification;
