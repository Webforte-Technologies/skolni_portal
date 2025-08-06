# 🎨 Design Guidelines – EduAI-Asistent

## 🎯 Design Philosophy

The EduAI-Asistent platform follows a **clean, professional, and trustworthy** design approach that prioritizes clarity, accessibility, and ease of use. The design should feel supportive and empowering, like a reliable assistant that teachers can depend on daily.

## 🎨 Visual Style

### Color Palette

**Primary Colors:**
- **Primary Blue**: `#4A90E2` - Professional, trustworthy, calm
- **Background**: `#F8F9FA` - Very light, soft grey
- **Text Primary**: `#212529` - Dark grey (not pure black for better readability)
- **Text Secondary**: `#6C757D` - Medium grey for secondary text
- **Border**: `#DEE2E6` - Light grey for subtle borders

**Semantic Colors:**
- **Success**: `#28A745` - Green for positive actions
- **Warning**: `#FFC107` - Yellow for warnings
- **Error**: `#DC3545` - Red for errors
- **Info**: `#17A2B8` - Blue for informational messages

### Typography

**Font Family:** Inter (sans-serif)
- **Primary Font**: Inter for all text elements
- **Fallback**: System sans-serif fonts

**Font Weights:**
- **Regular**: 400 (body text)
- **Medium**: 500 (emphasis, buttons)
- **Semi-Bold**: 600 (headings)
- **Bold**: 700 (important headings)

**Font Sizes:**
- **H1**: 2.5rem (40px) - Page titles
- **H2**: 2rem (32px) - Section headings
- **H3**: 1.5rem (24px) - Subsection headings
- **H4**: 1.25rem (20px) - Card titles
- **Body**: 1rem (16px) - Regular text
- **Small**: 0.875rem (14px) - Captions, labels
- **Extra Small**: 0.75rem (12px) - Fine print

### Spacing System

**Base Unit:** 0.25rem (4px)

**Spacing Scale:**
- **xs**: 0.25rem (4px)
- **sm**: 0.5rem (8px)
- **md**: 1rem (16px)
- **lg**: 1.5rem (24px)
- **xl**: 2rem (32px)
- **2xl**: 3rem (48px)
- **3xl**: 4rem (64px)

## 🧩 Component Design

### Buttons

**Primary Button:**
- Background: `#4A90E2`
- Text: White
- Border: None
- Border Radius: 0.375rem (6px)
- Padding: 0.75rem 1.5rem
- Hover: Slightly darker blue
- Focus: Blue outline

**Secondary Button:**
- Background: Transparent
- Text: `#4A90E2`
- Border: 1px solid `#4A90E2`
- Border Radius: 0.375rem (6px)
- Padding: 0.75rem 1.5rem
- Hover: Light blue background

**Danger Button:**
- Background: `#DC3545`
- Text: White
- Border: None
- Border Radius: 0.375rem (6px)
- Padding: 0.75rem 1.5rem

### Cards

**Standard Card:**
- Background: White
- Border: 1px solid `#DEE2E6`
- Border Radius: 0.5rem (8px)
- Shadow: Subtle drop shadow
- Padding: 1.5rem

**Interactive Card:**
- Same as standard card
- Hover: Slightly elevated shadow
- Transition: Smooth 0.2s ease

### Forms

**Input Fields:**
- Border: 1px solid `#DEE2E6`
- Border Radius: 0.375rem (6px)
- Padding: 0.75rem
- Focus: Blue border (`#4A90E2`)
- Background: White

**Labels:**
- Color: `#212529`
- Font Weight: 500
- Margin Bottom: 0.5rem

**Error States:**
- Border Color: `#DC3545`
- Text Color: `#DC3545`
- Error Message: Small red text below field

### Navigation

**Header:**
- Background: White
- Border Bottom: 1px solid `#DEE2E6`
- Height: 4rem (64px)
- Logo: Left side
- Navigation: Right side

**Sidebar (if applicable):**
- Background: `#F8F9FA`
- Border Right: 1px solid `#DEE2E6`
- Width: 16rem (256px)

## 📱 Responsive Design

### Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile-First Approach

1. **Design for mobile first**
2. **Use flexible grids**
3. **Touch-friendly targets** (minimum 44px)
4. **Readable text sizes** (minimum 16px for body)

### Responsive Behaviors

- **Navigation**: Collapses to hamburger menu on mobile
- **Cards**: Stack vertically on mobile
- **Forms**: Full width on mobile
- **Buttons**: Full width on mobile when primary actions

## 🎭 Interactive States

### Hover States
- Subtle color changes
- Smooth transitions (0.2s ease)
- Slight elevation for cards

### Focus States
- Clear blue outline
- Accessible for keyboard navigation
- High contrast for visibility

### Loading States
- Skeleton screens for content
- Spinning indicators for actions
- Disabled states for buttons

## 🚫 Design Don'ts

- ❌ No dark mode (Light Mode only)
- ❌ No complex animations or transitions
- ❌ No decorative elements or illustrations
- ❌ No gradients or complex backgrounds
- ❌ No rounded corners beyond 8px
- ❌ No shadows beyond subtle elevation

## ✅ Design Do's

- ✅ Clean, minimal interfaces
- ✅ High contrast for readability
- ✅ Consistent spacing and alignment
- ✅ Clear visual hierarchy
- ✅ Accessible color combinations
- ✅ Professional, trustworthy appearance

## 🎨 Brand Elements

### Logo
- Simple, clean design
- Blue primary color (`#4A90E2`)
- Scalable vector format

### Icons
- Consistent icon set (Feather Icons or similar)
- 16px, 20px, 24px sizes
- Monochrome with blue accent

### Photography/Graphics
- Professional, education-focused
- Clean, modern style
- Avoid stock photo clichés

## 📋 Implementation Notes

- Use Tailwind CSS utility classes
- Follow the spacing scale consistently
- Implement proper focus states for accessibility
- Test color contrast ratios
- Ensure responsive behavior on all devices
- Maintain consistency across all components

---

**Remember**: The goal is to create a professional, trustworthy, and easy-to-use platform that teachers will feel confident using in their daily workflow. 