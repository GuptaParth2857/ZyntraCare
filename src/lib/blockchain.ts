/**
 * Blockchain Simulation for Patient Data
 * 
 * Provides secure, tamper-proof storage for:
 * - Health records
 * - Medical prescriptions
 * - Lab results
 * - Supply chain data
 * 
 * Each record is hashed with previous hash creating a chain.
 */

import { useAppStore, type BlockchainRecord } from '@/store/useAppStore';
import { useCallback, useEffect } from 'react';

const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

async function sha256(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function calculateHash(index: number, previousHash: string, timestamp: number, data: string): Promise<string> {
  const payload = `${index}${previousHash}${timestamp}${data}`;
  return sha256(payload);
}

export function generateRecordId(): string {
  return `REC_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

export async function createRecord(
  type: string,
  data: string,
  previousHash: string = GENESIS_HASH
): Promise<BlockchainRecord> {
  const timestamp = Date.now();
  const index = 0;
  const hash = await calculateHash(index, previousHash, timestamp, data);
  
  return {
    id: generateRecordId(),
    type,
    dataHash: hash,
    previousHash,
    timestamp,
    data
  };
}

export async function verifyChain(records: BlockchainRecord[]): Promise<boolean> {
  if (records.length === 0) return true;
  
  let previousHash = GENESIS_HASH;
  
  for (const record of records) {
    const expectedHash = await calculateHash(0, previousHash, record.timestamp, record.data);
    
    if (record.dataHash !== expectedHash) {
      console.error('Chain verification failed:', record.id);
      return false;
    }
    
    previousHash = record.dataHash;
  }
  
  return true;
}

export function useBlockchain() {
  const { blockchainRecords, addBlockchainRecord } = useAppStore();

  const addRecord = useCallback(async (type: string, data: string) => {
    const previousHash = blockchainRecords.length > 0
      ? blockchainRecords[blockchainRecords.length - 1].dataHash
      : GENESIS_HASH;
    
    const record = await createRecord(type, data, previousHash);
    addBlockchainRecord(record);
    
    return record;
  }, [blockchainRecords, addBlockchainRecord]);

  const addHealthRecord = useCallback(async (record: {
    patientId: string;
    type: string;
    content: string;
    hospital: string;
    doctor: string;
  }) => {
    const data = JSON.stringify({
      patientId: record.patientId,
      type: record.type,
      content: record.content,
      hospital: record.hospital,
      doctor: record.doctor,
      date: new Date().toISOString()
    });
    
    return addRecord('health_record', data);
  }, [addRecord]);

  const addPrescription = useCallback(async (prescription: {
    patientId: string;
    medicines: string[];
    dosage: string;
    doctor: string;
    hospital: string;
  }) => {
    const data = JSON.stringify({
      patientId: prescription.patientId,
      medicines: prescription.medicines,
      dosage: prescription.dosage,
      doctor: prescription.doctor,
      hospital: prescription.hospital,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    return addRecord('prescription', data);
  }, [addRecord]);

  const addSupplyChainRecord = useCallback(async (record: {
    medicineId: string;
    batchNumber: string;
    manufacturer: string;
    distributor: string;
    pharmacy: string;
    status: string;
  }) => {
    const data = JSON.stringify({
      medicineId: record.medicineId,
      batchNumber: record.batchNumber,
      manufacturer: record.manufacturer,
      distributor: record.distributor,
      pharmacy: record.pharmacy,
      status: record.status,
      timestamp: new Date().toISOString()
    });
    
    return addRecord('supply_chain', data);
  }, [addRecord]);

  const verifyRecord = useCallback(async (recordId: string): Promise<boolean> => {
    const record = blockchainRecords.find(r => r.id === recordId);
    if (!record) return false;
    
    const index = blockchainRecords.findIndex(r => r.id === recordId);
    const previousHash = index === 0 ? GENESIS_HASH : blockchainRecords[index - 1].dataHash;
    
    const expectedHash = await calculateHash(0, previousHash, record.timestamp, record.data);
    return record.dataHash === expectedHash;
  }, [blockchainRecords]);

const getChainStats = useCallback(async () => {
    const recordsByType = blockchainRecords.reduce<Record<string, number>>((acc, record) => {
      acc[record.type] = (acc[record.type] || 0) + 1;
      return acc;
    }, {});
    
    return {
      totalRecords: blockchainRecords.length,
      recordsByType,
      isValid: await verifyChain(blockchainRecords),
      latestHash: blockchainRecords.length > 0
        ? blockchainRecords[blockchainRecords.length - 1].dataHash
        : GENESIS_HASH
    };
  }, [blockchainRecords]);

  return {
    records: blockchainRecords,
    addRecord,
    addHealthRecord,
    addPrescription,
    addSupplyChainRecord,
    verifyRecord,
    verifyChain: () => verifyChain(blockchainRecords),
    getChainStats
  };
}

export async function hashData(data: Record<string, unknown>): Promise<string> {
  return sha256(JSON.stringify(data));
}