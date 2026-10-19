'use client';
import {useEffect} from 'react';
export function MarketplaceReturn(){useEffect(()=>{if(!window.location.pathname.startsWith('/marketplace')&&/^#access_token=/.test(window.location.hash))window.location.replace(`/marketplace/account${window.location.hash}`);},[]);return null;}
