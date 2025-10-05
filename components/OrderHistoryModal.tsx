
import React, { useState, useEffect } from 'react';
import { ConfirmedOrder } from '../types';
import { fetchOrderHistory as mockFetchOrderHistory } from '../services/mockApi';
import { CloseIcon, BackIcon } from './Icons';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({ isOpen, onClose }) => {
  const [orders, setOrders] = useState<ConfirmedOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<ConfirmedOrder | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setSelectedOrder(null); // Reset detail view when modal opens
      mockFetchOrderHistory()
        .then(data => {
          setOrders(data);
        })
        .catch(err => console.error("Failed to fetch order history:", err))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen]);
  
  const modalClasses = isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none';
  const contentClasses = isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0';

  const handleSelectOrder = (order: ConfirmedOrder) => {
    setSelectedOrder(order);
  };

  const handleBackToList = () => {
    setSelectedOrder(null);
  };
  
  const renderListView = () => (
    <>
      {isLoading ? (
        <p className="text-center text-slate-400 py-10">جاري تحميل الطلبات...</p>
      ) : orders.length === 0 ? (
        <p className="text-center text-slate-400 py-10">لا يوجد طلبات سابقة.</p>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <div 
              key={order.id} 
              onClick={() => handleSelectOrder(order)}
              className="flex justify-between items-center gap-4 bg-slate-700/50 p-4 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors"
            >
              <div>
                <p className="font-bold text-amber-400">{order.id}</p>
                <p className="text-sm text-slate-300">
                  {
                    // Fix: Cast Intl options to 'any' to allow 'numberingSystem' which is not in the default TS lib definition.
                    new Date(order.date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', numberingSystem: 'latn' } as any)
                  }
                </p>
              </div>
              <div className="text-left">
                <p className="text-lg font-bold">{
                    // Fix: Cast Intl options to 'any' to allow 'numberingSystem' which is not in the default TS lib definition.
                    order.total.toLocaleString('ar-EG', { numberingSystem: 'latn' } as any)
                } درهم</p>
                <span className="text-xs bg-sky-500/50 text-sky-200 px-2 py-1 rounded-full">عرض التفاصيل</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );

  const renderDetailView = () => {
    if (!selectedOrder) return null;
    
    return (
      <div>
        {/* Customer Details */}
        <div className="p-4 mb-4 bg-slate-900/50 rounded-lg">
            <h3 className="font-bold text-lg mb-2 border-b border-slate-600 pb-2">بيانات العميل</h3>
            <div className="flex flex-col gap-2 text-sm">
                <p><strong>الاسم:</strong> {selectedOrder.customerName}</p>
                <p><strong>الهاتف:</strong> {selectedOrder.phone}</p>
                <p><strong>العنوان:</strong> {selectedOrder.address}</p>
            </div>
        </div>

        {/* Items */}
        <h3 className="font-bold text-lg mb-2">المنتجات</h3>
        <div className="space-y-2">
            {selectedOrder.items.map(item => (
                <div key={item.id} className="flex items-center gap-3 bg-slate-700/50 p-2 rounded-lg">
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded-md object-cover" />
                    <div className="flex-grow">
                        <p className="font-bold text-sm">{item.name}</p>
                        <p className="text-xs text-slate-400">{item.quantity} x {
                            // Fix: Cast Intl options to 'any' to allow 'numberingSystem' which is not in the default TS lib definition.
                            item.price.toLocaleString('ar-EG', { numberingSystem: 'latn' } as any)
                        } درهم</p>
                    </div>
                    <p className="font-bold text-amber-400 text-sm">{
                        // Fix: Cast Intl options to 'any' to allow 'numberingSystem' which is not in the default TS lib definition.
                        (item.price * item.quantity).toLocaleString('ar-EG', { numberingSystem: 'latn' } as any)
                    } درهم</p>
                </div>
            ))}
        </div>
        {/* Total */}
        <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between items-center">
            <p className="text-lg font-bold">الإجمالي:</p>
            <p className="text-2xl font-black text-amber-500">{
                // Fix: Cast Intl options to 'any' to allow 'numberingSystem' which is not in the default TS lib definition.
                selectedOrder.total.toLocaleString('ar-EG', { numberingSystem: 'latn' } as any)
            } درهم</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 bg-black/70 flex justify-center items-center p-4 z-50 transition-opacity duration-300 ${modalClasses}`}>
      <div className={`bg-slate-800 text-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col transition-all duration-300 ${contentClasses}`}>
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
             {selectedOrder && (
                <button onClick={handleBackToList} className="p-2 rounded-full hover:bg-slate-700 transition-colors">
                    <BackIcon />
                </button>
            )}
            <h2 className="text-xl font-bold text-amber-500">
                {selectedOrder ? `تفاصيل الطلب #${selectedOrder.id}` : 'سجل الطلبات'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-700 transition-colors"><CloseIcon /></button>
        </div>

        <div className="flex-grow p-4 overflow-y-auto">
            {selectedOrder ? renderDetailView() : renderListView()}
        </div>
      </div>
    </div>
  );
};

export default OrderHistoryModal;