'use client';
import { useParams } from 'next/navigation';
import SettlementWorkspace from '@/components/SettlementWorkspace';
export default function PropertySettlementsPage() { const params = useParams<{id:string}>(); return <SettlementWorkspace propertyId={Number(params.id)} />; }
