import React from 'react';
import { Loading } from 'concis';

export default function LoadingDemo1() {
  return (
    <div style={{ position: 'relative', width: '200px', height: '40px' }}>
      <Loading type="dot" />
    </div>
  );
}
