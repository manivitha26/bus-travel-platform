import React from 'react';
import SearchBuses from './components/SearchBuses';
import BookingForm from './components/BookingForm';
import CommunityFeed from './components/CommunityFeed';
import Notifications from './components/Notifications';
import ReviewSection from './components/ReviewSection';

function App() {
    return (
        <div>
            <h1>Bus Travel Platform</h1>
            <SearchBuses />
            <BookingForm />
            <CommunityFeed />
            <Notifications />
            <ReviewSection />
        </div>
    );
}

export default App;