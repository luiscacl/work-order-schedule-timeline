import { WorkOrder } from '../../core/models/work-order.model';

export const SEED_WORK_ORDERS: WorkOrder[] = [
  {
    docId: 'wo-1',
    docType: 'workOrder',
    data: {
      name: 'Matrix Ltd',
      workCenterId: 'wc-1',
      status: 'complete',
      startDate: '2025-11-03',
      endDate: '2025-12-22',
    },
  },
  {
    docId: 'wo-2',
    docType: 'workOrder',
    data: {
      name: 'Genesis Retrofit',
      workCenterId: 'wc-1',
      status: 'in-progress',
      startDate: '2026-02-03',
      endDate: '2026-03-27',
    },
  },

  {
    docId: 'wo-3',
    docType: 'workOrder',
    data: {
      name: 'Rodrigues Main Grid',
      workCenterId: 'wc-2',
      status: 'complete',
      startDate: '2025-12-01',
      endDate: '2026-01-22',
    },
  },
  {
    docId: 'wo-4',
    docType: 'workOrder',
    data: {
      name: 'South Cable Run',
      workCenterId: 'wc-2',
      status: 'in-progress',
      startDate: '2026-01-18',
      endDate: '2026-03-18',
    },
  },

  {
    docId: 'wo-5',
    docType: 'workOrder',
    data: {
      name: 'Konsulting Phase 1',
      workCenterId: 'wc-3',
      status: 'complete',
      startDate: '2025-10-20',
      endDate: '2025-12-10',
    },
  },
  {
    docId: 'wo-6',
    docType: 'workOrder',
    data: {
      name: 'Konsulting Phase 2',
      workCenterId: 'wc-3',
      status: 'open',
      startDate: '2026-03-20',
      endDate: '2026-05-15',
    },
  },

  {
    docId: 'wo-7',
    docType: 'workOrder',
    data: {
      name: 'McMarrow Expansion',
      workCenterId: 'wc-4',
      status: 'in-progress',
      startDate: '2026-02-10',
      endDate: '2026-04-06',
    },
  },
  {
    docId: 'wo-8',
    docType: 'workOrder',
    data: {
      name: 'Warehouse Route B',
      workCenterId: 'wc-4',
      status: 'blocked',
      startDate: '2026-04-12',
      endDate: '2026-06-08',
    },
  },

  {
    docId: 'wo-9',
    docType: 'workOrder',
    data: {
      name: 'Spartan Line Upgrade',
      workCenterId: 'wc-5',
      status: 'complete',
      startDate: '2025-11-15',
      endDate: '2026-01-08',
    },
  },
  {
    docId: 'wo-10',
    docType: 'workOrder',
    data: {
      name: 'Spartan QA Batch',
      workCenterId: 'wc-5',
      status: 'in-progress',
      startDate: '2026-01-28',
      endDate: '2026-03-31',
    },
  },

  {
    docId: 'wo-11',
    docType: 'workOrder',
    data: {
      name: 'Complex Core Build',
      workCenterId: 'wc-6',
      status: 'complete',
      startDate: '2025-12-08',
      endDate: '2026-02-02',
    },
  },
  {
    docId: 'wo-12',
    docType: 'workOrder',
    data: {
      name: 'Systems Validation',
      workCenterId: 'wc-6',
      status: 'blocked',
      startDate: '2026-03-24',
      endDate: '2026-05-20',
    },
  },

  {
    docId: 'wo-13',
    docType: 'workOrder',
    data: {
      name: 'Northline Freight Prep',
      workCenterId: 'wc-7',
      status: 'complete',
      startDate: '2025-09-22',
      endDate: '2025-11-14',
    },
  },
  {
    docId: 'wo-14',
    docType: 'workOrder',
    data: {
      name: 'Northline Dispatch',
      workCenterId: 'wc-7',
      status: 'open',
      startDate: '2026-04-02',
      endDate: '2026-05-28',
    },
  },

  {
    docId: 'wo-15',
    docType: 'workOrder',
    data: {
      name: 'Atlas Retrofit',
      workCenterId: 'wc-8',
      status: 'in-progress',
      startDate: '2026-02-16',
      endDate: '2026-04-14',
    },
  },
  {
    docId: 'wo-16',
    docType: 'workOrder',
    data: {
      name: 'Atlas Packaging',
      workCenterId: 'wc-8',
      status: 'open',
      startDate: '2026-04-20',
      endDate: '2026-06-16',
    },
  },

  {
    docId: 'wo-17',
    docType: 'workOrder',
    data: {
      name: 'Delta Assembly Lot 7',
      workCenterId: 'wc-9',
      status: 'complete',
      startDate: '2025-10-27',
      endDate: '2025-12-18',
    },
  },
  {
    docId: 'wo-18',
    docType: 'workOrder',
    data: {
      name: 'Delta Final Pass',
      workCenterId: 'wc-9',
      status: 'blocked',
      startDate: '2026-03-12',
      endDate: '2026-05-07',
    },
  },

  {
    docId: 'wo-19',
    docType: 'workOrder',
    data: {
      name: 'Nova Turbine Prep',
      workCenterId: 'wc-10',
      status: 'in-progress',
      startDate: '2026-01-22',
      endDate: '2026-03-24',
    },
  },
  {
    docId: 'wo-20',
    docType: 'workOrder',
    data: {
      name: 'Nova Field Test',
      workCenterId: 'wc-10',
      status: 'open',
      startDate: '2026-04-08',
      endDate: '2026-06-03',
    },
  },
];