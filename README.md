# Apple Store Management System

A modern web application for managing an Apple store's inventory, orders, employees, and customers. Built with React, TypeScript, and Supabase.

## Features

- Product Management (iPhones, Chargers, Cables, AirPods)
- Customer Management
- Employee Management
- Order Processing
- Inventory Tracking
- Real-time Stock Updates

## Tech Stack

- React
- TypeScript
- Supabase (Backend as a Service)
- date-fns (Date manipulation)
- UUID (Unique identifier generation)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account and project

### Installation

1. Clone the repository:

```bash
git clone [your-repository-url]
cd [repository-name]
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory and add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:

```bash
npm run dev
# or
yarn dev
```

## Project Structure

```
src/
  ├── components/    # Reusable UI components
  ├── lib/          # Utility functions and API calls
  ├── pages/        # Page components
  └── types/        # TypeScript type definitions
```

## Database Schema

The application uses the following main tables:

- products (with category-specific detail tables)
- customers
- employees
- orders
- order_items

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
