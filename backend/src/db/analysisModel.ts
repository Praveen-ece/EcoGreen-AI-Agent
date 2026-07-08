import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalysisDoc extends Document {
  productDescription: string;
  productName: string;
  category: string;
  material: string;
  carbonFootprint: string;         // LOW | MEDIUM | HIGH
  carbonFootprintKg: number;       // numeric CO₂ kg estimate
  sustainabilityScore: number;
  environmentalConcerns: string[];
  alternativesCount: number;
  bestChoiceProduct: string;
  createdAt: Date;
  rawAnalysis: object;             // full JSON blob for future use
}

const AnalysisSchema = new Schema<IAnalysisDoc>(
  {
    productDescription:   { type: String, required: true },
    productName:          { type: String, default: '' },
    category:             { type: String, default: '' },
    material:             { type: String, default: '' },
    carbonFootprint:      { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'MEDIUM' },
    carbonFootprintKg:    { type: Number, default: 0 },
    sustainabilityScore:  { type: Number, default: 0 },
    environmentalConcerns:{ type: [String], default: [] },
    alternativesCount:    { type: Number, default: 0 },
    bestChoiceProduct:    { type: String, default: '' },
    rawAnalysis:          { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const AnalysisModel = mongoose.model<IAnalysisDoc>('Analysis', AnalysisSchema);
