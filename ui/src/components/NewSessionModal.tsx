import { useState, useRef, type KeyboardEvent, type FormEvent } from 'react'
import { XIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import type { ClientProfile, Holding, RiskTolerance } from '../types'

const EMPTY_PROFILE: ClientProfile = {
  name: '',
  age: 30,
  risk_tolerance: 'moderate',
  annual_income: 80000,
  assets: { retirement_401k: 0, brokerage: 0, cash: 0 },
  current_holdings: [],
  goal: '',
  concerns: [],
}

interface FormErrors {
  name?: string
  age?: string
  goal?: string
}

function validate(p: ClientProfile): FormErrors {
  const errors: FormErrors = {}
  if (!p.name.trim()) errors.name = 'Name is required'
  if (p.age < 18 || p.age > 100) errors.age = 'Age must be between 18 and 100'
  if (!p.goal.trim()) errors.goal = 'Goal is required'
  return errors
}

const inputCls =
  'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900 placeholder-gray-400'
const labelCls = 'block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1'

interface Props {
  initial?: ClientProfile | null
  onSave: (profile: ClientProfile) => void
  onClose: () => void
}

export function NewSessionModal({ initial, onSave, onClose }: Props) {
  const [profile, setProfile] = useState<ClientProfile>(initial ?? EMPTY_PROFILE)
  const [errors, setErrors] = useState<FormErrors>({})
  const [concernInput, setConcernInput] = useState('')
  const concernRef = useRef<HTMLInputElement>(null)

  const isEditing = !!initial

  const set = <K extends keyof ClientProfile>(key: K, value: ClientProfile[K]) =>
    setProfile(p => ({ ...p, [key]: value }))

  const setAsset = (key: keyof ClientProfile['assets'], value: number) =>
    setProfile(p => ({ ...p, assets: { ...p.assets, [key]: value } }))

  const addHolding = () =>
    setProfile(p => ({
      ...p,
      current_holdings: [...p.current_holdings, { symbol: '', shares: 0, avg_cost: 0 }],
    }))

  const updateHolding = (i: number, field: keyof Holding, value: string | number) =>
    setProfile(p => ({
      ...p,
      current_holdings: p.current_holdings.map((h, idx) =>
        idx === i ? { ...h, [field]: value } : h,
      ),
    }))

  const removeHolding = (i: number) =>
    setProfile(p => ({
      ...p,
      current_holdings: p.current_holdings.filter((_, idx) => idx !== i),
    }))

  const addConcern = () => {
    const val = concernInput.trim()
    if (val && !profile.concerns.includes(val)) {
      set('concerns', [...profile.concerns, val])
      setConcernInput('')
    }
  }

  const removeConcern = (c: string) =>
    set('concerns', profile.concerns.filter(x => x !== c))

  const handleConcernKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); addConcern() }
    if (e.key === 'Backspace' && !concernInput && profile.concerns.length > 0)
      set('concerns', profile.concerns.slice(0, -1))
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const errs = validate(profile)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    onSave(profile)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">
            {isEditing ? 'Edit Client Profile' : 'Set Up Client Profile'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <XIcon size={18} />
          </button>
        </div>

        {!isEditing && (
          <div className="px-6 py-3 bg-blue-50 border-b border-blue-100">
            <p className="text-xs text-blue-700">
              Set up the client profile once. You can start as many advisory sessions as you like
              using this profile — or edit it anytime from the sidebar.
            </p>
          </div>
        )}

        {/* Form body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* Client information */}
          <section>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Client Information
            </h3>
            <div className="space-y-3">
              <div>
                <label className={labelCls}>Full Name</label>
                <input
                  className={inputCls}
                  placeholder="e.g. Sarah Kim"
                  value={profile.name}
                  onChange={e => set('name', e.target.value)}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Age</label>
                  <input
                    type="number"
                    className={inputCls}
                    min={18}
                    max={100}
                    value={profile.age}
                    onChange={e => set('age', Number(e.target.value))}
                  />
                  {errors.age && <p className="text-xs text-red-500 mt-1">{errors.age}</p>}
                </div>
                <div>
                  <label className={labelCls}>Risk Tolerance</label>
                  <select
                    className={inputCls}
                    value={profile.risk_tolerance}
                    onChange={e => set('risk_tolerance', e.target.value as RiskTolerance)}
                  >
                    <option value="conservative">Conservative</option>
                    <option value="moderate">Moderate</option>
                    <option value="aggressive">Aggressive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelCls}>Annual Income ($)</label>
                <input
                  type="number"
                  className={inputCls}
                  min={0}
                  step={1000}
                  value={profile.annual_income}
                  onChange={e => set('annual_income', Number(e.target.value))}
                />
              </div>
            </div>
          </section>

          {/* Assets */}
          <section>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Assets ($)
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {(
                [
                  ['retirement_401k', '401(k)'],
                  ['brokerage', 'Brokerage'],
                  ['cash', 'Cash'],
                ] as const
              ).map(([key, label]) => (
                <div key={key}>
                  <label className={labelCls}>{label}</label>
                  <input
                    type="number"
                    className={inputCls}
                    min={0}
                    step={1000}
                    value={profile.assets[key]}
                    onChange={e => setAsset(key, Number(e.target.value))}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Holdings */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Current Holdings
              </h3>
              <button
                type="button"
                onClick={addHolding}
                className="flex items-center gap-1 text-xs text-blue-600 font-medium hover:text-blue-700 transition-colors"
              >
                <PlusIcon size={12} />
                Add
              </button>
            </div>

            {profile.current_holdings.length > 0 && (
              <div className="space-y-2">
                <div className="grid grid-cols-[1fr_80px_90px_28px] gap-2 mb-1">
                  {['Symbol', 'Shares', 'Avg Cost', ''].map(h => (
                    <span key={h} className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      {h}
                    </span>
                  ))}
                </div>
                {profile.current_holdings.map((h, i) => (
                  <div key={i} className="grid grid-cols-[1fr_80px_90px_28px] gap-2 items-center">
                    <input
                      className={inputCls}
                      placeholder="AAPL"
                      value={h.symbol}
                      onChange={e => updateHolding(i, 'symbol', e.target.value.toUpperCase())}
                    />
                    <input
                      type="number"
                      className={inputCls}
                      min={0}
                      value={h.shares || ''}
                      onChange={e => updateHolding(i, 'shares', Number(e.target.value))}
                    />
                    <input
                      type="number"
                      className={inputCls}
                      min={0}
                      step={0.01}
                      value={h.avg_cost || ''}
                      onChange={e => updateHolding(i, 'avg_cost', Number(e.target.value))}
                    />
                    <button
                      type="button"
                      onClick={() => removeHolding(i)}
                      className="flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2Icon size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Goal */}
          <section>
            <label className={labelCls}>Investment Goal</label>
            <input
              className={inputCls}
              placeholder="e.g. retire comfortably in 25 years"
              value={profile.goal}
              onChange={e => set('goal', e.target.value)}
            />
            {errors.goal && <p className="text-xs text-red-500 mt-1">{errors.goal}</p>}
          </section>

          {/* Concerns */}
          <section>
            <label className={labelCls}>Concerns</label>
            <div
              className="flex flex-wrap gap-1.5 p-2 border border-gray-300 rounded-lg min-h-[42px] cursor-text focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500"
              onClick={() => concernRef.current?.focus()}
            >
              {profile.concerns.map(c => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-md"
                >
                  {c}
                  <button type="button" onClick={() => removeConcern(c)}>
                    <XIcon size={10} className="text-gray-400 hover:text-gray-600" />
                  </button>
                </span>
              ))}
              <input
                ref={concernRef}
                className="flex-1 min-w-[120px] text-sm outline-none bg-transparent text-gray-900 placeholder-gray-400"
                placeholder={profile.concerns.length === 0 ? 'Type a concern, press Enter' : ''}
                value={concernInput}
                onChange={e => setConcernInput(e.target.value)}
                onKeyDown={handleConcernKey}
                onBlur={addConcern}
              />
            </div>
          </section>

          {/* Spacer for footer */}
          <div />
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            {isEditing ? 'Save Changes' : 'Save Profile →'}
          </button>
        </div>
      </div>
    </div>
  )
}
