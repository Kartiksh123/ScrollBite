require('dotenv').config({ path: require('node:path').resolve(__dirname, '../.env') })

const fs = require('node:fs/promises')
const path = require('node:path')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const foodPartnerModel = require('../src/models/foodpartner.model')
const foodModel = require('../src/models/food.model')

const demoPassword = 'ScrollBiteDemo123!'

const partnerSeeds = [
  { name: 'Juniper Table', contactName: 'Aarav Mehta', phone: '+91 80 5550 0101', address: '12th Main Road, Indiranagar, Bengaluru', email: 'juniper.table@example.com' },
  { name: 'Kosha Kitchen', contactName: 'Mira Shah', phone: '+91 22 5550 0102', address: 'Hill Road, Bandra West, Mumbai', email: 'kosha.kitchen@example.com' },
  { name: 'Little Olive Trattoria', contactName: 'Rohan Dutta', phone: '+91 33 5550 0103', address: 'Hindustan Park, Gariahat, Kolkata', email: 'little.olive@example.com' },
  { name: 'Paper Lantern Noodles', contactName: 'Anika Rao', phone: '+91 20 5550 0104', address: 'Prabhat Road, Deccan, Pune', email: 'paper.lantern@example.com' },
  { name: 'Sunday Sourdough Co.', contactName: 'Kabir Reddy', phone: '+91 40 5550 0105', address: 'Road No. 10, Jubilee Hills, Hyderabad', email: 'sunday.sourdough@example.com' }
]

const reelSeeds = [
  { partner: 'juniper.table@example.com', legacyName: 'Chilli Crisp Paneer Toast', name: 'Fresh Pasta, Made In-House', description: 'Semolina dough goes through the pasta roller before being cut into silky ribbons for tonight’s special.', video: 'fresh-pasta-making.mp4', likeCount: 42, savesCount: 18 },
  { partner: 'juniper.table@example.com', legacyName: 'Miso Butter Mushroom Bowl', name: 'A Pantry of Pasta Shapes', description: 'A look at the pantry staples behind our pasta menu, from ridged rigatoni to little shells made for catching sauce.', video: 'pasta-pantry.mp4', likeCount: 31, savesCount: 12 },
  { partner: 'juniper.table@example.com', legacyName: 'Charred Corn & Lime Kulcha', name: 'Parmesan at the Pass', description: 'Freshly cooked pasta gets its final shower of parmesan just before it leaves the kitchen.', video: 'parmesan-pasta-finish.mp4', likeCount: 56, savesCount: 23 },
  { partner: 'kosha.kitchen@example.com', legacyName: 'Malai Tikka Roomali Roll', name: 'Slow-Simmered Vegetable Curry', description: 'Seasonal vegetables simmer with toasted spices until the gravy turns rich, fragrant and ready for warm roti.', video: 'indian-veg-curry.mp4', likeCount: 89, savesCount: 34 },
  { partner: 'kosha.kitchen@example.com', legacyName: 'Bombay Masala Egg Bun', name: 'The House Chicken Curry', description: 'A homestyle curry built in the pan with ginger, tomato and a freshly ground spice blend.', video: 'indian-curry-kitchen.mp4', likeCount: 64, savesCount: 21 },
  { partner: 'kosha.kitchen@example.com', legacyName: 'Tandoori Cauliflower Bites', name: 'Market-Fresh Samosas', description: 'Hand-folded pastry hits the hot oil until crisp and golden. Served with our date and tamarind chutney.', video: 'street-samosa.mp4', likeCount: 48, savesCount: 19 },
  { partner: 'little.olive@example.com', legacyName: 'Sunday Tomato Tagliatelle', name: 'Margherita, From the Dough Up', description: 'Our pizza starts with a slow-fermented base, a bright tomato layer and fresh mozzarella.', video: 'margherita-prep.mp4', likeCount: 102, savesCount: 47 },
  { partner: 'little.olive@example.com', legacyName: 'Brown Butter Sage Gnocchi', name: 'The Classic Pizza', description: 'Tomato, mozzarella and a little olive oil come together on a hand-stretched base before the oven.', video: 'classic-pizza-making.mp4', likeCount: 73, savesCount: 29 },
  { partner: 'little.olive@example.com', legacyName: 'Burrata Peperonata Toast', name: 'Hand-Stretched Pizza Dough', description: 'A soft, airy dough gets shaped by hand for a light crust with just the right chew.', video: 'pizza-dough-prep.mp4', likeCount: 91, savesCount: 38 },
  { partner: 'paper.lantern@example.com', legacyName: 'Garlic Chilli Dan Dan Noodles', name: 'Cucumber Maki Rolls', description: 'Nori, seasoned rice and crisp cucumber rolled together, then cut into neat little bites.', video: 'sushi-roll-prep.mp4', likeCount: 118, savesCount: 53 },
  { partner: 'paper.lantern@example.com', legacyName: 'Crispy Tofu Bento', name: 'Sushi on the Pass', description: 'A fresh plate of maki rolls is finished by hand and sent straight from our counter to your table.', video: 'sushi-plating.mp4', likeCount: 77, savesCount: 32 },
  { partner: 'paper.lantern@example.com', legacyName: 'Five-Spice Chilli Oil Dumplings', name: 'Weeknight Shoyu Ramen', description: 'Noodles simmer in a savory broth with warming spice, sweet corn and a handful of fresh greens.', video: 'ramen-simmer.mp4', likeCount: 95, savesCount: 41 },
  { partner: 'sunday.sourdough@example.com', legacyName: 'Hot Honey Halloumi Melt', name: 'The Sunday Sourdough Burger', description: 'A juicy patty, crisp lettuce and house sauce stacked between toasted sourdough buns.', video: 'sourdough-burger.mp4', likeCount: 133, savesCount: 62 },
  { partner: 'sunday.sourdough@example.com', legacyName: 'Roasted Tomato Whipped Feta', name: 'Chocolate Petit Fours', description: 'Small-batch chocolate treats are moulded and finished by hand for the pastry counter.', video: 'chocolate-petit-fours.mp4', likeCount: 86, savesCount: 37 },
  { partner: 'sunday.sourdough@example.com', legacyName: 'Pistachio Morning Bun', name: 'Berry Tart, Finished to Order', description: 'Fresh berries are placed over a crisp pastry shell for a bright, not-too-sweet finish.', video: 'berry-tart-plating.mp4', likeCount: 109, savesCount: 49 }
]

async function seedDemo() {
  if (!process.env.MONGODB_URI) throw new Error('Set MONGODB_URI in backend/.env before seeding demo data.')
  await Promise.all(reelSeeds.map(reel => fs.access(path.resolve(__dirname, '../../videos', reel.video))))
  await mongoose.connect(process.env.MONGODB_URI)

  const password = await bcrypt.hash(demoPassword, 10)
  const partnersByEmail = new Map()
  for (const partner of partnerSeeds) {
    const savedPartner = await foodPartnerModel.findOneAndUpdate(
      { email: partner.email },
      { $set: { ...partner, password } },
      { upsert: true, returnDocument: 'after', runValidators: true }
    )
    partnersByEmail.set(partner.email, savedPartner._id)
  }

  for (const reel of reelSeeds) {
    const foodPartner = partnersByEmail.get(reel.partner)
    const { legacyName, video, ...foodFields } = reel
    const oldSeed = await foodModel.findOne({ foodPartner, name: legacyName })
    const fields = { name: foodFields.name, description: foodFields.description, video: `/media/${video}`, foodPartner }
    if (oldSeed) {
      await foodModel.updateOne({ _id: oldSeed._id }, { $set: fields }, { runValidators: true })
      continue
    }
    const existingSeed = await foodModel.findOne({ foodPartner, name: reel.name })
    if (existingSeed) {
      await foodModel.updateOne({ _id: existingSeed._id }, { $set: fields }, { runValidators: true })
    } else {
      await foodModel.create({ ...fields, likeCount: reel.likeCount, savesCount: reel.savesCount })
    }
  }

  console.log(`Demo seed ready: ${partnerSeeds.length} food partners and ${reelSeeds.length} reels.`)
  if (process.env.NODE_ENV !== 'production') console.log(`Demo partner password: ${demoPassword}`)
}

seedDemo()
  .catch((error) => { console.error('Demo seed failed:', error.message); process.exitCode = 1 })
  .finally(async () => { await mongoose.disconnect() })
