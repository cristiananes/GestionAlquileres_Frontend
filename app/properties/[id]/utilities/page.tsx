'use client';
import { useParams } from 'next/navigation';
import UtilityWorkspace from '@/components/UtilityWorkspace';
export default function PropertyUtilitiesPage() { const params = useParams<{id:string}>(); return <UtilityWorkspace propertyId={Number(params.id)} />; }
