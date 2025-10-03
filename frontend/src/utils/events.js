// utils/events.js - Simple event bus for application-wide events

const eventBus = {
  // Method to emit an event
  emit: (eventName, data = {}) => {
    const event = new CustomEvent(eventName, { detail: data });
    window.dispatchEvent(event);
    console.log(`Event emitted: ${eventName}`, data);
  },

  // Method to listen for an event
  on: (eventName, callback) => {
    window.addEventListener(eventName, callback);
    return () => window.removeEventListener(eventName, callback);
  },

  // Method to remove a listener
  off: (eventName, callback) => {
    window.removeEventListener(eventName, callback);
  }
};

// Event constants
export const EVENTS = {
  INVOICE_GENERATED: 'invoice:generated',
  INVOICE_UPDATED: 'invoice:updated',
  BOOKING_COMPLETED: 'booking:completed'
};

export default eventBus;