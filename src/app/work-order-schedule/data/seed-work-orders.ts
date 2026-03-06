import { WorkOrder } from '../../core/models/work-order.model';

export const SEED_WORK_ORDERS: WorkOrder[] = [
  {
    docId: 'wo-1',
    docType: 'workOrder',
    data: {
      name: 'Order A',
      workCenterId: 'wc-1',
      status: 'open',
      startDate: '2026-02-01',
      endDate: '2026-05-30',
    },
  },
  {
    docId: 'wo-2',
    docType: 'workOrder',
    data: {
      name: 'Order B',
      workCenterId: 'wc-2',
      status: 'in-progress',
      startDate: '2026-02-06',
      endDate: '2026-04-14',
    },
  },
  {
    docId: 'wo-3',
    docType: 'workOrder',
    data: {
      name: 'Order A',
      workCenterId: 'wc-3',
      status: 'complete',
      startDate: '2026-01-15',
      endDate: '2026-03-04',
    },
  },
  {
    docId: 'wo-4',
    docType: 'workOrder',
    data: {
      name: 'Order B',
      workCenterId: 'wc-4',
      status: 'blocked',
      startDate: '2026-03-06',
      endDate: '2026-05-14',
    },
  },
];