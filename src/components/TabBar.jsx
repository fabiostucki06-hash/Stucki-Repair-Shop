import { IconHouse, IconWrench, IconDoc, IconPerson, IconPlus } from './icons.jsx'

const TABS = [
  { id: 'dashboard', Icon: IconHouse,  label: 'Übersicht' },
  { id: 'auftraege', Icon: IconWrench, label: 'Aufträge'  },
  { id: '__fab__',   Icon: null,       label: null         },
  { id: 'offerten',  Icon: IconDoc,    label: 'Offerten'  },
  { id: 'kunden',    Icon: IconPerson, label: 'Kunden'    },
]

export function TabBar({ activeTab, onTabChange, fabOpen, onFabToggle }) {
  return (
    <div className="tab-bar">
      {TABS.map((item) => {
        if (item.id === '__fab__') {
          return (
            <div key="fab" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: 2 }}>
              <button
                onClick={onFabToggle}
                style={{
                  width: 48, height: 48, borderRadius: 24,
                  background: 'linear-gradient(to bottom,rgba(84,164,255,0.95) 0%,rgba(0,122,255,0.95) 50%,rgba(0,86,179,0.95) 100%)',
                  color: '#fff', border: '1px solid #004fb0',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: 'inset 0 1px 0px rgba(255,255,255,0.7),inset 0 -1px 2px rgba(0,0,0,0.15),0 6px 14px rgba(0,0,0,0.18)',
                  transform: fabOpen ? 'rotate(45deg)' : 'rotate(0)',
                  transition: 'transform 0.22s cubic-bezier(.34,1.56,.64,1)',
                }}
              >
                <IconPlus size={20} />
              </button>
            </div>
          )
        }

        const active = activeTab === item.id
        return (
          <button
            key={item.id}
            className="tab-item"
            onClick={() => onTabChange(item.id)}
            style={{ color: active ? 'var(--blue)' : 'var(--label2)' }}
          >
            <div className="tab-icon"><item.Icon /></div>
            <span className="tab-label" style={{ fontWeight: active ? 600 : 400 }}>{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}
