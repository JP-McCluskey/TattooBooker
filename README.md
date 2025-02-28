# Tattoo Booker

A modern web application that connects tattoo artists with clients, making it easy to discover, book, and manage tattoo appointments.

<img width="1028" alt="Screenshot 2025-02-27 at 12 11 45 PM" src="https://github.com/user-attachments/assets/d4d3a70a-833c-4312-83b9-8affe6c2a775" />

## 🌐 Live Demo

Visit the live application at [https://tattoobooker.netlify.app](https://tattoobooker.netlify.app)

## ✨ Features

### For Clients
- 🔍 Search and explore tattoo artists and studios
- 💫 Browse tattoo galleries with advanced filtering
- ❤️ Like and bookmark favorite tattoo designs
- 📅 Book appointments with preferred artists
- 👤 Personal profile management
- 🌙 Dark/Light mode support
- 🌐 Multi-language support (English/French)

### For Artists/Studios
- 🎨 Portfolio management
- 📊 Business profile customization
- 📅 Appointment management
- 🏷️ Custom tags and categories

## 🚀 Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Deployment**: Netlify

## 🔑 Key Features in Detail

### Search and Discovery
- Advanced filtering by style and location
- Geolocation-based studio finder

### User Profiles
- Secure authentication
- Profile customization
- Booking history
- Favorite designs

### Business Management
- Studio profile management
- Artist portfolio showcase
- Appointment scheduling

### Image Management
- High-quality image uploads
- Style tagging
- Portfolio showcase

## 🛠️ Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/tattoo-booker.git
   cd tattoo-booker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a Supabase project:
   - Go to [Supabase](https://supabase.com)
   - Create a new project
   - Get your project URL and anon key

4. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add your Supabase credentials:
     ```env
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

5. Run database migrations:
   ```bash
   npx supabase migration up
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

## 💻 Development

### Prerequisites
- Node.js 16+
- npm or yarn
- Git

### Code Style
We use ESLint and Prettier for code formatting. Please ensure your code follows our style guide by running:
```bash
npm run lint
npm run format
```

### Testing
Run the test suite:
```bash
npm run test
```

### Building for Production
```bash
npm run build
```

## 🔮 Roadmap

- [ ] Mobile app development
- [ ] Real-time chat between artists and clients
- [ ] Online payment integration
- [ ] Review and rating system
- [ ] Artist verification system
- [ ] Integration with popular calendar apps

## 👏 Acknowledgments

- [Supabase](https://supabase.com) for the backend infrastructure
- [shadcn/ui](https://ui.shadcn.com) for the beautiful UI components
- [Lucide Icons](https://lucide.dev) for the icon set
- All contributors who have helped shape this project

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email thetattoobooker@gmail.com 
