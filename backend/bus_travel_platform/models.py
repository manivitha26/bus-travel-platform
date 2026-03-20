from django.db import models

# User model for users in the travel platform
class User(models.Model):
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.username

# Bus model for storing bus details
class Bus(models.Model):
    bus_number = models.CharField(max_length=20, unique=True)
    bus_type = models.CharField(max_length=50)
    capacity = models.IntegerField()
    operator = models.CharField(max_length=100)

    def __str__(self):
        return self.bus_number

# Route model for storing bus routes
class Route(models.Model):
    source = models.CharField(max_length=100)
    destination = models.CharField(max_length=100)
    distance = models.FloatField()
    duration = models.DurationField()

    def __str__(self):
        return f'{self.source} to {self.destination}'

# Booking model to handle bus bookings
class Booking(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    bus = models.ForeignKey(Bus, on_delete=models.CASCADE)
    route = models.ForeignKey(Route, on_delete=models.CASCADE)
    booking_date = models.DateTimeField(auto_now_add=True)
    seats_booked = models.IntegerField()

    def __str__(self):
        return f'Booking by {self.user.username} on {self.booking_date}'

# CommunityPost model for posts in the community spaces
class CommunityPost(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

# Forum model to represent discussion forums
class Forum(models.Model):
    title = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

# Review model for bus reviews
class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    bus = models.ForeignKey(Bus, on_delete=models.CASCADE)
    rating = models.IntegerField(choices=[(i,i) for i in range(1, 6)])
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Review by {self.user.username} for {self.bus.bus_number}'

# Notification model to handle notifications for users
class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.CharField(max_length=250)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Notification for {self.user.username}'
