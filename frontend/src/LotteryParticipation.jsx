import { useState, useEffect, useContext } from 'react';
import { useAuth } from './context/AuthContext';
import API_BASE from './api';

const LOTTERY_PRICE = 10000; // 10,000 RWF per month

function getCurrentMonthYear() {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

function getMonthName(month) {
  const date = new Date(2000, month - 1, 1);
  return date.toLocaleString('default', { month: 'long' });
}

function LotteryParticipation() {
  const [selectedMonths, setSelectedMonths] = useState([]);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [processing, setProcessing] = useState(false);
  const [lotteryHistory, setLotteryHistory] = useState([]);
  
  const { month: currentMonth, year: currentYear } = getCurrentMonthYear();
  const { user } = useAuth();
  // Support both id and _id formats
  const userId = user?._id || user?.id;
  
  // Debug: Log the user object and ID
  useEffect(() => {
    console.log('Current user object:', user);
    console.log('User ID from auth context:', userId);
  }, [user, userId]);

  // Generate available months (only next month)
  useEffect(() => {
    const months = [];
    let month = currentMonth + 1; // Next month
    let year = currentYear;
    
    // Handle year rollover
    if (month > 12) {
      month = 1;
      year++;
    }
    
    months.push({ month, year });
    setAvailableMonths(months);
    fetchLotteryHistory();
  }, []);

  const fetchLotteryHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/lottery/history`);
      const data = await res.json();
      if (res.ok) {
        setLotteryHistory(data);
      }
    } catch (err) {
      console.error('Failed to fetch lottery history:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleMonth = (month, year) => {
    // Only allow one month to be selected at a time
    setSelectedMonths([{ month, year }]);
  };

  const handleBuyLottery = async () => {
    if (!user) {
      setError('You must be logged in to participate in the lottery');
      return;
    }

    if (selectedMonths.length === 0) {
      setError('Please select at least one month');
      return;
    }

    const totalCost = LOTTERY_PRICE;
    const monthName = getMonthName(selectedMonths[0].month);
    const year = selectedMonths[0].year;
    
    if (!window.confirm(
      `You are about to purchase lottery for: ${monthName} ${year}\n\n` +
      `Total Amount: ${totalCost.toLocaleString()} RWF\n\nDo you want to proceed?`
    )) {
      return;
    }

    setProcessing(true);
    setError('');
    setSuccess('');

    try {
      // Debug logging
      console.log('User ID from localStorage:', userId);
      console.log('Selected months before processing:', selectedMonths);

      // Validate we have the required data
      if (!userId) {
        throw new Error('User ID is missing. Please log in again.');
      }

      if (!selectedMonths || selectedMonths.length === 0) {
        throw new Error('No months selected for purchase');
      }

      // Ensure we're sending the correct data types
      const payload = {
        member: userId.trim(), // Ensure no whitespace
        months: selectedMonths.map(({ month, year }) => {
          const monthNum = Number(month);
          const yearNum = Number(year);
          
          if (isNaN(monthNum) || isNaN(yearNum)) {
            throw new Error(`Invalid month/year format: ${month}/${year}`);
          }
          
          return {
            month: monthNum,
            year: yearNum
          };
        })
      };

      console.log('Sending payload:', JSON.stringify(payload, null, 2)); // For debugging

      const response = await fetch(`${API_BASE}/lottery/buyout`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to process lottery purchase');
      
      // Process results
      const successfulPurchases = data.results.filter(r => r.success);
      const failedPurchases = data.results.filter(r => !r.success);
      
      let successMessage = '';
      if (successfulPurchases.length > 0) {
        successMessage = `Successfully purchased lottery for ${successfulPurchases.length} month(s)!`;
      }
      
      if (failedPurchases.length > 0) {
        const failedMonths = failedPurchases
          .map(({ month, year }) => `${getMonthName(month)} ${year}: ${failedPurchases[0].message}`)
          .join('\n- ');
        setError(`Failed to purchase some months:\n- ${failedMonths}`);
      }
      
      if (successMessage) {
        setSuccess(successMessage);
        // Remove successfully purchased months from selection
        setSelectedMonths(prev => 
          prev.filter(m => 
            !successfulPurchases.some(sp => sp.month === m.month && sp.year === m.year)
          )
        );
        fetchLotteryHistory();
      }
    } catch (err) {
      setError(err.message || 'An error occurred while processing your request');
    } finally {
      setProcessing(false);
    }
  };

  // Check if a month is already bought or drawn
  const isMonthUnavailable = (month, year) => {
    return lotteryHistory.some(lottery => 
      lottery.month === month && 
      lottery.year === year && 
      (lottery.status === 'bought' || lottery.status === 'active')
    );
  };

  const totalAmount = selectedMonths.length > 0 ? LOTTERY_PRICE : 0;

  if (loading) return <div>Loading lottery information...</div>;

  return (
    <div className="lottery-participation">
      <h3>Participate in Lottery</h3>
      <p>Buy lottery tickets for upcoming months. Each month costs 10,000 RWF.</p>
      
      <div className="month-selection">
        <h4>Available Months</h4>
        <div className="month-grid">
          {availableMonths.map(({ month, year }) => {
            const isSelected = selectedMonths.some(m => m.month === month && m.year === year);
            const isUnavailable = isMonthUnavailable(month, year);
            const isInPast = year < currentYear || (year === currentYear && month < currentMonth);
            
            return (
              <button
                key={`${month}-${year}`}
                className={`month-button ${isSelected ? 'selected' : ''} ${isUnavailable ? 'unavailable' : ''}`}
                onClick={() => !isUnavailable && !isInPast && toggleMonth(month, year)}
                disabled={isUnavailable || isInPast}
                title={isUnavailable ? 'Already drawn or bought' : isInPast ? 'Cannot buy for past months' : `Buy for ${getMonthName(month)} ${year}`}
              >
                <div className="month-name">{getMonthName(month)}</div>
                <div className="year">{year}</div>
                {isUnavailable && <div className="status-badge">Taken</div>}
              </button>
            );
          })}
        </div>
      </div>

      {selectedMonths.length > 0 && (
        <div className="selection-summary">
          <h4>Your Selection</h4>
          <ul>
            {selectedMonths.map(({ month, year }) => (
              <li key={`selected-${month}-${year}`}>
                {getMonthName(month)} {year} - 10,000 RWF
              </li>
            ))}
          </ul>
          <div className="total-amount">
            <strong>Total: {totalAmount.toLocaleString()} RWF</strong>
          </div>
          <button 
            className="buy-button" 
            onClick={handleBuyLottery}
            disabled={processing}
          >
            {processing ? 'Processing...' : 'Confirm Purchase'}
          </button>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <style jsx>{`
        .lottery-participation {
          padding: 1rem;
        }
        .month-selection {
          margin: 1.5rem 0;
        }
        .month-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }
        
        /* Responsive adjustments for month grid */
        @media (max-width: 768px) {
          .month-grid {
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
            gap: 0.8rem;
          }
          
          .month-button {
            padding: 0.8rem;
          }
          
          .month-name {
            font-size: 1em;
          }
          
          .year {
            font-size: 0.8em;
          }
        }
        
        @media (max-width: 480px) {
          .month-grid {
            grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
            gap: 0.6rem;
          }
          
          .month-button {
            padding: 0.6rem;
            min-height: 80px;
          }
          
          .month-name {
            font-size: 0.9em;
            font-weight: 600;
          }
          
          .year {
            font-size: 0.75em;
          }
          
          .status-badge {
            font-size: 0.6em;
            padding: 1px 4px;
          }
          
          .lottery-participation {
            padding: 0.8rem;
          }
          
          .selection-summary {
            padding: 0.8rem;
          }
          
          .buy-button {
            padding: 1rem;
            font-size: 1em;
          }
        }
        .month-button {
          position: relative;
          padding: 1rem;
          border: 2px solid #ddd;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
        }
        .month-button:hover:not(:disabled) {
          border-color: #4CAF50;
          background: #f8fff8;
        }
        .month-button.selected {
          border-color: #4CAF50;
          background: #f0fff0;
        }
        .month-button.unavailable {
          opacity: 0.6;
          cursor: not-allowed;
          background-color: #f8f8f8;
        }
        .month-button:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }
        .month-name {
          font-weight: bold;
          font-size: 1.1em;
        }
        .year {
          color: #666;
          font-size: 0.9em;
        }
        .status-badge {
          position: absolute;
          top: 4px;
          right: 4px;
          background: #ff5252;
          color: white;
          font-size: 0.7em;
          padding: 2px 6px;
          border-radius: 10px;
        }
        .selection-summary {
          background: #f8f9fa;
          padding: 1rem;
          border-radius: 8px;
          margin-top: 1.5rem;
        }
        .selection-summary ul {
          list-style: none;
          padding: 0;
          margin: 1rem 0;
        }
        .selection-summary li {
          padding: 0.5rem 0;
          border-bottom: 1px solid #eee;
        }
        .total-amount {
          font-size: 1.2em;
          margin: 1rem 0;
          text-align: right;
          padding: 0.5rem;
          background: #e9ecef;
          border-radius: 4px;
        }
        .buy-button {
          display: block;
          width: 100%;
          padding: 0.8rem;
          background: #4CAF50;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 1.1em;
          cursor: pointer;
          transition: background 0.2s;
        }
        .buy-button:hover:not(:disabled) {
          background: #43a047;
        }
        .buy-button:disabled {
          background: #a5d6a7;
          cursor: not-allowed;
        }
        .error-message {
          color: #d32f2f;
          margin: 1rem 0;
          padding: 0.8rem;
          background: #ffebee;
          border-radius: 4px;
        }
        .success-message {
          color: #2e7d32;
          margin: 1rem 0;
          padding: 0.8rem;
          background: #e8f5e9;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}

export default LotteryParticipation;
