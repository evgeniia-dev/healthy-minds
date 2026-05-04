"""
Prevents duplicate emails
Enforces role-based access

Professionals can:
View their patients list
Create new patient accounts
Automatically link patients to themselves
"""


from fastapi import APIRouter, Depends, HTTPException, status # FastAPI tools

from sqlalchemy.orm import Session # database session
from app.db.session import get_db # DB dependency

from app.dependencies import get_current_user # get logged-in user
from app.models.user import User # user model
from app.models.patient_link import PatientProfessionalLink # link between patient and professional
from app.schemas.patient import CreatePatientRequest # request schema
from app.core.security import hash_password # password hashing


# router for patient management (professional only)
router = APIRouter(prefix="/patients", tags=["patients"])

# registered professional can list patients by using PatientProfessionalLink table in the database
@router.get("")
def get_patients(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # only professionals can access patients list
    if current_user.role != "professional":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only professionals can view patients",
        )

    # get all patient links for this professional
    links = (
        db.query(PatientProfessionalLink)
        .filter(PatientProfessionalLink.professional_id == current_user.id)
        .order_by(PatientProfessionalLink.created_at.desc())
        .all()
    )

    # extract patient IDs from links
    patient_ids = [link.patient_id for link in links]

    # if no patients, return empty list
    if not patient_ids:
        return []

    # fetch patient user data
    patients = (
        db.query(User)
        .filter(User.id.in_(patient_ids))
        .all()
    )

    # map patients by ID for quick lookup
    patient_map = {patient.id: patient for patient in patients}

    # build response list
    result = []
    for link in links:
        patient = patient_map.get(link.patient_id)
        if not patient:
            continue

        result.append(
            {
                "id": str(patient.id),
                "email": patient.email,
                "full_name": patient.full_name,
                "avatar_url": patient.avatar_url,
                "created_at": link.created_at.isoformat(),
            }
        )

    return result

# registered professional can create patients with basic information through suggested format in CreatePatientRequest 
@router.post("")
def create_patient(
    payload: CreatePatientRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # only professionals can create patients
    if current_user.role != "professional":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only professionals can create patients",
        )

    # check if email already exists
    existing_user = db.query(User).filter(User.email == payload.email).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered",
        )

    # create new patient user
    patient = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        full_name=payload.full_name,
        role="patient",
        is_active=True,
    )

    db.add(patient)
    db.flush()

    link = PatientProfessionalLink(
        patient_id=patient.id,
        professional_id=current_user.id,
    )

    db.add(link)
    db.commit()
    db.refresh(patient)

    # return created patient info
    return {
        "id": str(patient.id),
        "email": patient.email,
        "full_name": patient.full_name,
        "avatar_url": patient.avatar_url,
        "created_at": link.created_at.isoformat(),
    }