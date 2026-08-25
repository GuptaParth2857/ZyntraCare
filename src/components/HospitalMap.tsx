'use client';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState, useCallback } from 'react';
import { FiPlus, FiMinus, FiNavigation, FiRefreshCw } from 'react-icons/fi';
import { Hospital } from '@/types';
import { useGeolocation } from '@/hooks/useGeolocation';
import DirectionsModal from './DirectionsModal';