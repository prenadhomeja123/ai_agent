from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.mail import send_mail
from django.conf import settings
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer
from .models import User, OTP


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        # Debug: Print user details to console
        print("\n" + "="*60)
        print("[USER REGISTERED]")
        print(f"ID: {user.id}")
        print(f"Email: {user.email}")
        print(f"Username: {user.username}")
        print(f"Email Verified: {user.email_verified}")
        print("="*60 + "\n")
        # Don't return token yet - user needs to verify OTP first
        return Response({
            'user': UserSerializer(user).data,
            'message': 'Registration successful. Please verify your email with OTP.',
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        
        # Check if email is verified
        if not user.email_verified:
            return Response({
                'requiresOTP': True,
                'message': 'Please verify your email with OTP first.',
            }, status=status.HTTP_200_OK)
        
        # If verified, return token
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'token': str(refresh.access_token),
            'refresh': str(refresh),
            'requiresOTP': False,
        }, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def send_otp(request):
    email = request.data.get('email')
    purpose = request.data.get('purpose', 'verification')
    
    if not email:
        return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Debug: Print all users in database
    all_users = User.objects.all()
    print("\n" + "="*60)
    print("[DEBUG] All users in database:")
    for u in all_users:
        print(f"  - ID: {u.id}, Email: {u.email}, Username: {u.username}")
    print(f"[DEBUG] Looking for email: {email}")
    print("="*60 + "\n")
    
    # Case-insensitive email lookup
    try:
        user = User.objects.get(email__iexact=email)
    except User.DoesNotExist:
        return Response({
            'error': f'User with email "{email}" does not exist. Please register first.',
            'debug': f'Available emails: {[u.email for u in User.objects.all()]}'
        }, status=status.HTTP_404_NOT_FOUND)
    except User.MultipleObjectsReturned:
        # If multiple users found (shouldn't happen), get the first one
        user = User.objects.filter(email__iexact=email).first()
    
    # Create OTP
    otp = OTP.create_otp(user, email, purpose)
    
    # Send OTP via email (console backend prints to terminal in development)
    try:
        send_mail(
            subject='Your OTP Code - Infinite Base Agent',
            message=f'Your OTP code is: {otp.code}\n\nThis code will expire in 10 minutes.',
            from_email=settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else 'noreply@infinitebaseagent.com',
            recipient_list=[email],
            fail_silently=False,
        )
        # Also print to console for visibility
        print("\n" + "="*60)
        print("[OTP SENT TO TERMINAL] Console Email Backend")
        print(f"Email: {email}")
        print(f"OTP Code: {otp.code}")
        print(f"Expires in: 10 minutes")
        print("="*60 + "\n")
    except Exception as e:
        # Fallback: print OTP to console if email fails
        print("\n" + "="*60)
        print("[WARNING] EMAIL FAILED - OTP PRINTED TO CONSOLE")
        print(f"Email: {email}")
        print(f"OTP Code: {otp.code}")
        print(f"Error: {str(e)}")
        print("="*60 + "\n")
    
    # Always return OTP in response for development/testing
    return Response({
        'message': 'OTP sent successfully! Check your terminal/console for the OTP code.',
        'otp': otp.code,  # Always return OTP for easy testing
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp(request):
    email = request.data.get('email')
    otp_code = request.data.get('otp')
    
    if not email or not otp_code:
        return Response({'error': 'Email and OTP are required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'error': 'User with this email does not exist'}, status=status.HTTP_404_NOT_FOUND)
    
    # Find valid OTP
    try:
        otp = OTP.objects.filter(
            user=user,
            email=email,
            code=otp_code,
            is_used=False
        ).latest('created_at')
        
        if not otp.is_valid():
            return Response({'error': 'OTP has expired. Please request a new one.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Mark OTP as used
        otp.mark_as_used()
        
        # Mark email as verified
        user.email_verified = True
        user.save()
        
        # Generate token
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'OTP verified successfully.',
            'user': UserSerializer(user).data,
            'token': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_200_OK)
        
    except OTP.DoesNotExist:
        return Response({'error': 'Invalid OTP code.'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def get_current_user(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

